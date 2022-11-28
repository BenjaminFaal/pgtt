<script lang="ts">
    import "carbon-components-svelte/css/all.css";
    import '../app.css';

    import {
        Column,
        Content,
        Grid,
        Header,
        HeaderAction,
        HeaderGlobalAction,
        HeaderNav,
        HeaderNavItem,
        HeaderPanelLink,
        HeaderPanelLinks,
        HeaderUtilities,
        Row,
        SkipToContent,
        Theme,
        ToastNotification,
    } from "carbon-components-svelte";
    import Home from "carbon-icons-svelte/lib/Home.svelte";
    import DataBase from "carbon-icons-svelte/lib/DataBase.svelte";
    import Information from "carbon-icons-svelte/lib/Information.svelte";
    import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
    import {page} from "$app/stores";

    import {toasts} from "$lib/toast";

    import * as pkg from '../../package.json';

    import type {CarbonIcon} from "carbon-icons-svelte/lib";

    type Page = {
        icon: CarbonIcon
        title: string
    }

    const pages: Record<string, Page> = {
        '/': {
            icon: Home,
            title: 'Home'
        },
        '/databases': {
            icon: DataBase,
            title: 'Databases',
        },
        '/info': {
            icon: Information,
            title: 'Info'
        },
    }
</script>

<svelte:head>
    <title>{pkg.name} - {pkg.shortDescription}</title>
</svelte:head>

<Header company={pkg.name} platformName={pkg.shortDescription}>
    <div slot="skip-to-content">
        <SkipToContent/>
    </div>
    <HeaderNav>
        {#each Object.keys(pages) as pagePath}
            <HeaderNavItem
                    sveltekit:prefetch
                    href={pagePath}
                    icon={pages[pagePath].icon}
                    isSelected={pagePath === '/' ? $page.path === pagePath : $page.path.includes(pagePath)}
                    text={pages[pagePath].title}
            />
        {/each}
    </HeaderNav>
    <HeaderUtilities>
        <HeaderGlobalAction aria-label="GitHub" href={pkg.repository.url} target="_blank" on:click={()=>window.open(pkg.repository.url, '_blank')} icon={LogoGithub} />
        <HeaderAction>
            <HeaderPanelLinks>
                <HeaderPanelLink>
                    Settings
                </HeaderPanelLink>
                <Theme persist render="select"/>
            </HeaderPanelLinks>
        </HeaderAction>
    </HeaderUtilities>
</Header>

<Content>
    <Grid>
        <Row>
            <Column>
                <slot/>
            </Column>
        </Row>
    </Grid>
</Content>

<div class="toasts">
    {#each $toasts as toast}
        <ToastNotification {...toast}/>
    {/each}
</div>

<style>
    .toasts {
        position: fixed;
        top: 50px;
        right: 0;
    }
</style>
