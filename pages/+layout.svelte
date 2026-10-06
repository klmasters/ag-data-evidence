<script>
	import '@evidence-dev/tailwind/fonts.css';
	import '../app.css';
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<!-- Breadcrumbs are off: Evidence hardcodes their first crumb as "Home", which reads as the
     portfolio home page but links to the Overview page. -->
<EvidenceDefaultLayout
	{data}
	title="Kansas Cattle Data"
	homePageName="Overview"
	hideBreadcrumbs={true}
>
	<slot slot="content" />
</EvidenceDefaultLayout>
