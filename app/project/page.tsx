import type { Metadata } from 'next';
import { ProjectGeneratorClient } from '@/components/ProjectGeneratorClient';

export const metadata:Metadata={title:'AI Game Project Generator',description:'ゲームのアイデアと確認した条件から、Vertical Slice、制作ロードマップ、Codex向け指示、素材、リスクを生成します。',alternates:{canonical:'/project/'},openGraph:{url:'/project/'}};

export default function ProjectPage(){return <ProjectGeneratorClient/>;}
