import { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Password",
    description: "New Password",
};

export default function NewPasswordLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
