<script context="module" lang="ts">
    import type {Load} from '@sveltejs/kit';

    async function fetchDatabases({fetch}) {
        const res = await fetch('/databases.json');

        if (res.ok) {
            const databases = await res.json();

            return {
                props: {databases}
            };
        }

        const {message} = await res.json();

        return {
            error: new Error(message)
        };
    }

    export const load: Load = async ({fetch}) => {
        return fetchDatabases({fetch});
    };
</script>

<script lang="ts">
    import DatabaseController from "$lib/components/DatabaseController.svelte";
    import type {Database} from "$lib/types/Database";

    export let databases: Database[];

    function refreshDatabases() {
        fetchDatabases({fetch}).then(res => databases = res.props.databases)
    }
</script>

<h3>Databases</h3>
<div>
    {#each databases as database}
        <DatabaseController database={database} on:refresh={refreshDatabases}/>
        <br>
        <br>
        <br>
    {/each}
</div>

{#if !databases || databases.length === 0}
    <h4>No databases, create a database first.</h4>
{/if}