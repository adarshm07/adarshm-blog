import Head from "next/head";

type Meta = {
    title: string,
    keywords: string,
    description: string,
    ogTitle: string,
    ogType: string,
    ogUrl: string,
    ogImage: string
}

const Meta = ({ title, keywords, description, ogTitle, ogType, ogUrl, ogImage }: Meta) => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
            <meta name="keywords" content={keywords}></meta>
            <meta name="description" content={description}></meta>
            <meta property="og:title" content={ogTitle} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={ogUrl} />
            <meta property="og:image" content={ogImage} />
            <meta charSet="utf-8"></meta>
            <link rel="icon" href="/favicon.ico"></link>
            <title>{title}</title>
        </Head>
    );
}

export default Meta;