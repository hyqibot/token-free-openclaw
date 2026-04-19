import React, { forwardRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useChatAnywhereMessages } from "../Context/ChatAnywhereMessagesContext";
import { ChatAnywhereInputContext } from "../Context/ChatAnywhereInputContext";
import { emit } from "../Context/useChatAnywhereEventEmitter";
// 逐步放开
function Ref(_, ref) {
  var messages = useChatAnywhereMessages();
  var setDisabled = useContextSelector(ChatAnywhereInputContext, function (v) {
    return v.setDisabled;
  });
  React.useImperativeHandle(ref, function () {
    return {
      messages: messages,
      input: {
        setDisabled: setDisabled,
        submit: function submit(data) {
          var query = data.query,
            fileList = data.fileList,
            biz_params = data.biz_params;
          emit({
            type: 'handleSubmit',
            data: {
              query: query,
              fileList: fileList,
              biz_params: biz_params
            }
          });
        }
      }
    };
  }, []);
  return null;
}
export default /*#__PURE__*/forwardRef(Ref);