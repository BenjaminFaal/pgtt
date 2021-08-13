<script context="module" lang="ts">
    export const prerender = true;

    import * as pkg from '../../package.json'
</script>

<img src="favicon.png" width="100" alt={pkg.name}/>
<h1>
    {pkg.name} v{pkg.version}
</h1>
<br>
<p>{pkg.description}</p>