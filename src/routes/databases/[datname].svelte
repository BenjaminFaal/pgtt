<script context="module" lang="ts">
    import type {Load} from '@sveltejs/kit';

    async function fetchDatabase(datname: string, {fetch}) {
        const res = await fetch(`/databases/${datname}.json`);

        if (res.ok) {
            const database = await res.json();

            return {
                props: {database}
            };
        }

        const {message} = await res.json();

        return {
            error: new Error(message)
        };
    }

    export const load: Load = async ({page, fetch}) => {
        return fetchDatabase(page.params.datname, {fetch});
    };
</script>

<script lang="ts">
    import DatabaseController from "$lib/components/DatabaseController.svelte";
    import type {Database} from "$lib/types/Database";

    export let database: Database;

    function refreshDatabase() {
        fetchDatabase(database.datname, {fetch}).then(res => database = res.props.database)
    }
</script>

<h3>Database {database.datname}</h3>
<DatabaseController database={database} on:refresh={refreshDatabase}/>
