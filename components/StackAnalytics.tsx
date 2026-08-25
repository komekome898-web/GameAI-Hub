'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
export function StackView({slug}:{slug:string}) { useEffect(()=>track('stack_view',{page:`/stacks/${slug}`,stack:slug}),[slug]); return null; }
export function StackAction({event,slug,href,className,children}:{event:'stack_to_builder'|'compare_start';slug:string;href:string;className?:string;children:React.ReactNode}) { return <Link href={href} className={className} onClick={()=>track(event,{page:`/stacks/${slug}`,stack:slug})}>{children}</Link>; }
