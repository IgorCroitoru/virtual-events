import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactNode } from "react";

type PageWithLayout = NextPage & {
	Layout?: ({ children }: { children: ReactNode }) => JSX.Element;
};

type AppPropsWithLayout = AppProps & {
	Component: PageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	const Layout = Component.Layout ?? (({ children }) => <>{children}</>);

	return (
		<Layout>
			<Component {...pageProps} />
		</Layout>
	);
}
