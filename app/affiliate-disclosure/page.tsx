import type { Metadata } from 'next';
import Link from 'next/link';
import { TrustPage, TrustStatus } from '@/components/TrustPage';
export const metadata:Metadata={title:'広告・アフィリエイト開示',alternates:{canonical:'/affiliate-disclosure/'},openGraph:{url:'/affiliate-disclosure/'}};
export default function Page(){return <TrustPage eyebrow="AFFILIATE DISCLOSURE" title="広告・アフィリエイト開示" summary={<p>一部の外部リンクから申込みや購入が行われると、運営者が報酬を受け取る場合があります。報酬は推薦や比較の判断に使いません。</p>} sections={[
{id:'identify',label:'対象リンクの見分け方',content:<><p>対象リンクの近くで「広告・アフィリエイト」等と明示します。アフィリエイトリンクには技術的に <code>rel=&quot;sponsored nofollow noopener&quot;</code> を付け、外部サイトへ移動することを示します。</p><TrustStatus tone="neutral" title="リンク先"><p>登録済みの場合はアフィリエイトURL、未登録の場合は公式URLへ案内します。</p></TrustStatus></>},
{id:'neutrality',label:'編集・推薦との分離',content:<><p>報酬の有無や金額によって、掲載順位、推薦、比較結果、編集上の結論、視覚的な目立ち方を変更しません。アフィリエイト報酬を、ツールの品質や適合性の根拠にはしません。</p><p><Link href="/methodology/">調査・評価方法を確認する</Link></p></>},
{id:'verify',label:'申込み前の確認',content:<><p>価格、無料枠、権利、対象プラン、適用条件は変更される場合があります。申込みや公開の前に、リンク先の公式情報と規約をご確認ください。</p></>},
{id:'privacy',label:'クリックとプライバシー',content:<><p>外部サイトでは各事業者のプライバシーポリシーが適用されます。当サイトの計測と外部リンクの扱いは、<Link href="/privacy/">プライバシーポリシー</Link>で説明しています。</p></>},
]}/>}
