import Bubble from './Bubble';
import List from './BubbleList';
import Spin from './Spin';
import Footer from './Footer';
import Interrupted from './Interrupted';
export type { BubbleProps } from './interface';
type BubbleType = typeof Bubble & {
    List: typeof List;
    Spin: typeof Spin;
    Footer: typeof Footer;
    Interrupted: typeof Interrupted;
};
declare const _default: BubbleType;
export default _default;
