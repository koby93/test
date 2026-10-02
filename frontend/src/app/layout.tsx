import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'NITA | Technical Clearance & Conformity', description: 'Integrated government ICT project assurance platform — Module 0 foundation.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
