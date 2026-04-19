import type { Conversation, Groupable } from '../interface';
type GroupList = {
    data: Conversation[];
    name?: string;
    title?: Groupable['title'];
}[];
declare const useGroupable: (groupable?: boolean | Groupable, items?: Conversation[]) => [groupList: GroupList, enableGroup: boolean];
export default useGroupable;
