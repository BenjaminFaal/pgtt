<script context="module" lang="ts">
    import type {Load} from '@sveltejs/kit';

    async function fetchInfo({fetch}) {
        const res = await fetch('/info.json');

        if (res.ok) {
            const info = await res.json();

            return {
                props: {info}
            };
        }

        const {message} = await res.json();

        return {
            error: new Error(message),
        };
    }

    export const load: Load = async ({fetch}) => {
        return fetchInfo({fetch});
    };
</script>

<script lang="ts">
    import {DataTable} from "carbon-components-svelte";
    import {onMount} from "svelte";

    type Info = {
        connection: Record<string, any>,
        status: Record<string, any>[]
    }

    export let info: Info;

    onMount(() => {
        const interval = setInterval(async () => {
            info = (await fetchInfo({fetch})).props.info
        }, 1000);
        return function () {
            clearInterval(interval);
        }
    });
</script>

<DataTable
        title="Server"
        description="Server status"
        headers={[{ key: 'name', value: 'Name' }, { key: 'value', value: 'Value' }]}
        rows={Object.keys(info.status).map(key => {return {id: key, name: key.substring(0, 1).toUpperCase() + key.substring(1, key.length), value: info.status[key]}})}
/>
<br>
<DataTable
        title="Connection"
        description="Connection settings"
        headers={[{ key: 'name', value: 'Name' }, { key: 'value', value: 'Value' }]}
        rows={Object.keys(info.connection).map(key => {return {id: key, name: key.substring(0, 1).toUpperCase() + key.substring(1, key.length), value: info.connection[key]}})}
/>