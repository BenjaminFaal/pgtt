<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import fileSize from 'filesize';
    import {
        Button,
        Column,
        DataTable,
        InlineLoading,
        Link,
        Modal,
        Row,
        TextArea,
        TooltipDefinition
    } from "carbon-components-svelte";
    import Undo16 from "carbon-icons-svelte/lib/Undo16";
    import Delete16 from "carbon-icons-svelte/lib/Delete16";

    import {COPY_INFIX} from "$lib/constants";
    import type {Copy, Database} from "$lib/types/Database";
    import {toast} from "$lib/toast";

    const eventDispatcher = createEventDispatcher();

    export let database: Database;

    let comment: string;

    let loadingStatus: string = 'active';

    onMount(() => loadingStatus = 'finished');

    let confirmOpen: boolean;
    let confirmHeading: string;
    let confirmDanger: boolean;
    let confirmText: string;
    let confirmCallback: () => void;

    async function doRequest(path: string, method: string, body?: any, confirmMessage?: string) {
        if (confirmMessage) {
            confirmHeading = `Confirm`;
            confirmText = confirmMessage;
            confirmDanger = method.toLowerCase() === 'delete';
            confirmOpen = true;

            confirmCallback = function () {
                confirmCallback = undefined;
                confirmOpen = false;
                doRequest(path, method, body);
            }
            return;
        }
        loadingStatus = 'active';
        await fetch(`/databases/copy/${path}`, {
            method: method,
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'content-type': 'application/json'
            }
        }).then(async res => {
            loadingStatus = res.ok ? 'finished' : 'error';
            toast({
                kind: res.ok ? 'success' : 'error',
                title: res.ok ? 'Success' : 'Error',
                subtitle: await res.text(),
            });
        }).finally(() => {
            eventDispatcher('refresh');
        });
    }

    async function createDatabase(databaseName: string, commentText: string) {
        await doRequest('create.json', 'POST', {databaseName: database.datname, comment: commentText});
        comment = '';
    }

    async function doCopyRequest(copy: Copy, action: string, method: string) {
        await doRequest(`${copy.datname}/${action}.json`, method, undefined, `Are you sure you want to ${action} "${copy.datname}"?`);
    }

    const COPIES_TABLE_HEADERS = [
        {key: 'datname', value: 'Name'},
        {key: 'comment', value: 'Comment', display: comment => comment || ''},
        {key: 'date', value: 'Date'},
        {key: 'size', value: 'Size', display: fileSize},
        {key: 'operations', value: 'Operations'}
    ];
</script>

<DataTable
        headers={COPIES_TABLE_HEADERS}
        rows={database.copies.map(copy=>{return{...copy, id: copy.datname}})}>
    <Link slot="title" svelte:prefetch href="/databases/{database.datname}">
        {#if loadingStatus}
            <InlineLoading status={loadingStatus}/>
        {/if}
        <h4>{database.datname}</h4>
    </Link>
    <div slot="description">
        <TooltipDefinition tooltipText={`${database.size} bytes`}>{fileSize(database.size)}</TooltipDefinition>
    </div>
    <div slot="cell" let:row={copy} let:cell>
        {#if cell.key === 'operations'}
            <Button size="small" iconDescription="Restore copy" icon={Undo16}
                    on:click={doCopyRequest.bind(this, copy, 'restore', 'POST')}/>
            <Button kind="danger" size="small" iconDescription="Delete copy" icon={Delete16}
                    on:click={doCopyRequest.bind(this, copy, 'delete', 'DELETE')}/>
        {:else if cell.key === 'date'}
            {new Date(parseInt(copy.datname.split(COPY_INFIX)[1])).toLocaleString()}
        {:else}
            {#if cell.display}
                {cell.display(cell.value)}
            {:else}
                {cell.value}
            {/if}
        {/if}
    </div>
</DataTable>

<Column>
    <Row>
        <TextArea bind:value={comment} rows="1" placeholder="Enter a comment..."/>
        <Button disabled={loadingStatus === 'active'} size="sm" type="submit"
                on:click={createDatabase.bind(this, database.datname, comment)}>
            Create copy
        </Button>
    </Row>
</Column>

<Modal
        bind:open={confirmOpen}
        modalHeading={confirmHeading}
        danger={confirmDanger}
        primaryButtonText="Yes"
        secondaryButtonText="No"
        on:click:button--secondary={() => (confirmOpen = false)}
        on:submit={confirmCallback}>
    <p>{confirmText}</p>
</Modal>