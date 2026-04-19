function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { produce } from "immer";
import { AgentScopeRuntimeRunStatus, AgentScopeRuntimeContentType, AgentScopeRuntimeMessageType } from "../types";
import { uuid } from "../../../..";
var AgentScopeRuntimeResponseBuilder = /*#__PURE__*/function () {
  function AgentScopeRuntimeResponseBuilder(_ref) {
    var id = _ref.id,
      status = _ref.status,
      created_at = _ref.created_at;
    _classCallCheck(this, AgentScopeRuntimeResponseBuilder);
    _defineProperty(this, "data", void 0);
    this.data = {
      id: id,
      output: [],
      object: 'response',
      status: status || AgentScopeRuntimeRunStatus.Created,
      created_at: created_at || Date.now()
    };
  }
  _createClass(AgentScopeRuntimeResponseBuilder, [{
    key: "handleResponse",
    value: function handleResponse(data) {
      this.data = produce(this.data, function (draft) {
        if (!data.output) {
          data.output = [];
        }
        Object.assign(draft, data);
      });
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(data) {
      this.data = produce(this.data, function (draft) {
        if (!draft.output) {
          draft.output = [];
        }
        var existingIndex = draft.output.findIndex(function (msg) {
          return msg.id === data.id;
        });
        if (existingIndex >= 0) {
          var existingContent = draft.output[existingIndex].content;
          Object.assign(draft.output[existingIndex], data);
          if (!data.content || data.content.length === 0) {
            draft.output[existingIndex].content = existingContent;
          }
        } else {
          draft.output.push(data);
        }
      });
    }
  }, {
    key: "handleContent",
    value: function handleContent(data) {
      this.data = produce(this.data, function (draft) {
        var msg = draft.output.find(function (m) {
          return m.id === data.msg_id;
        });
        if (!msg) {
          console.warn('Message not found for content:', data.msg_id);
          return;
        }
        if (!msg.content) {
          msg.content = [];
        }
        if (data.delta) {
          var lastContent = msg.content[msg.content.length - 1];
          if (lastContent && lastContent.delta) {
            if (data.type === AgentScopeRuntimeContentType.TEXT && lastContent.type === AgentScopeRuntimeContentType.TEXT) {
              lastContent.text += data.text;
            } else if (data.type === AgentScopeRuntimeContentType.IMAGE) {
              lastContent.image_url = data.image_url;
            } else if (data.type === AgentScopeRuntimeContentType.DATA) {
              lastContent.data = data.data;
            }
          } else {
            msg.content.push(data);
          }
        } else {
          if (msg.content.length > 0) {
            Object.assign(msg.content[msg.content.length - 1], data);
          } else {
            msg.content.push(data);
          }
        }
      });
    }
  }, {
    key: "handleError",
    value: function handleError(data) {
      this.data = produce(this.data, function (draft) {
        draft.status = AgentScopeRuntimeRunStatus.Failed;
        draft.output.push({
          status: AgentScopeRuntimeRunStatus.Failed,
          type: AgentScopeRuntimeMessageType.ERROR,
          content: [],
          id: uuid(),
          role: 'assistant',
          code: data.code,
          message: typeof data.message === 'string' ? data.message : JSON.stringify(data.message)
        });
      });
    }
  }, {
    key: "handle",
    value: function handle(data) {
      if (data.object === 'response') {
        this.handleResponse(data);
      } else if (data.object === 'message') {
        if (data.type === AgentScopeRuntimeMessageType.HEARTBEAT) return this.data;
        this.handleMessage(data);
      } else if (data.object === 'content') {
        this.handleContent(data);
      } else {
        this.handleError(data);
      }
      return this.data;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.data = produce(this.data, function (draft) {
        if (AgentScopeRuntimeResponseBuilder.maybeGenerating(draft)) {
          draft.status = AgentScopeRuntimeRunStatus.Canceled;
        }
        draft.output.forEach(function (msg) {
          if (AgentScopeRuntimeResponseBuilder.maybeGenerating(msg)) {
            msg.status = AgentScopeRuntimeRunStatus.Canceled;
            msg.content.forEach(function (content) {
              if (AgentScopeRuntimeResponseBuilder.maybeGenerating(content)) {
                content.status = AgentScopeRuntimeRunStatus.Canceled;
              }
            });
          }
        });
      });
      return this.data;
    }
  }], [{
    key: "mergeToolMessages",
    value: function mergeToolMessages(messages) {
      var bufferMessagesMap = new Map();
      var resMessages = [];
      var _iterator = _createForOfIteratorHelper(messages),
        _step;
      try {
        var _loop = function _loop() {
          var _message$content, _message$content2;
          var message = _step.value;
          if (AgentScopeRuntimeResponseBuilder.maybeToolInput(message) && (_message$content = message.content) !== null && _message$content !== void 0 && _message$content.length) {
            var content = message.content[0];
            var key = content.data.call_id || content.data.name;
            bufferMessagesMap.set(key, content);
            resMessages.push(message);
          } else if (AgentScopeRuntimeResponseBuilder.maybeToolOutput(message) && (_message$content2 = message.content) !== null && _message$content2 !== void 0 && _message$content2.length) {
            var _content = message.content[0];
            var _key = _content.data.call_id || _content.data.name;
            var bufferContent = bufferMessagesMap.get(_key);
            if (bufferContent) {
              resMessages = resMessages.map(function (i) {
                if (!AgentScopeRuntimeResponseBuilder.maybeToolInput(i)) return i;
                var preContent = i.content[0];
                var preKey = preContent.data.call_id || preContent.data.name;
                if (preKey === _key) {
                  return _objectSpread(_objectSpread({}, message), {}, {
                    content: [].concat(_toConsumableArray(i.content), [_content])
                  });
                } else {
                  return i;
                }
              });
            }
          } else {
            resMessages.push(message);
          }
        };
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return resMessages;
    }
  }, {
    key: "maybeToolOutput",
    value: function maybeToolOutput(message) {
      return [AgentScopeRuntimeMessageType.FUNCTION_CALL_OUTPUT, AgentScopeRuntimeMessageType.PLUGIN_CALL_OUTPUT, AgentScopeRuntimeMessageType.COMPONENT_CALL_OUTPUT, AgentScopeRuntimeMessageType.MCP_CALL_OUTPUT].includes(message.type);
    }
  }, {
    key: "maybeToolInput",
    value: function maybeToolInput(message) {
      return [AgentScopeRuntimeMessageType.FUNCTION_CALL, AgentScopeRuntimeMessageType.PLUGIN_CALL, AgentScopeRuntimeMessageType.COMPONENT_CALL, AgentScopeRuntimeMessageType.MCP_CALL].includes(message.type);
    }
  }, {
    key: "maybeGenerating",
    value: function maybeGenerating(data) {
      return [AgentScopeRuntimeRunStatus.InProgress, AgentScopeRuntimeRunStatus.Created].includes(data.status);
    }
  }, {
    key: "maybeDone",
    value: function maybeDone(data) {
      return [AgentScopeRuntimeRunStatus.Completed, AgentScopeRuntimeRunStatus.Canceled, AgentScopeRuntimeRunStatus.Failed].includes(data.status);
    }
  }]);
  return AgentScopeRuntimeResponseBuilder;
}();
export default AgentScopeRuntimeResponseBuilder;