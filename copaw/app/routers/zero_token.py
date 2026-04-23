import threading,uuid
from fastapi import APIRouter,Body,HTTPException
from pydantic import BaseModel,Field
from ...zero_token.webauth import deepseek_webauth,doubao_webauth,claude_webauth,qwen_webauth,qwen_cn_webauth,kimi_webauth,chatgpt_webauth,gemini_webauth,glm_webauth,glm_intl_webauth,launch_chrome_debug,ensure_chrome_debug
from ...zero_token.gateway_manager import ensure_running, stop, status

router=APIRouter(prefix="/zero-token",tags=["zero-token"])
_S:dict[str,dict]={}

class StartResp(BaseModel): id:str=Field(...)
class StatusResp(BaseModel):
  status:str;log:list[str]=Field(default_factory=list);result:dict|None=None;error:str|None=None

class EnsureChromeDebugBody(BaseModel):
  urls:list[str]|None=None

@router.post("/ensure-chrome-debug")
def post_ensure_chrome_debug(body:EnsureChromeDebugBody=Body(default_factory=EnsureChromeDebugBody)):
  """显式 ``ensure_chrome_debug``（9222 + argv 开页）。内置 Node 网关豆包 CDP 失败路径已不再回调本端点；由控制台弹窗引导一键授权。"""
  u=body.urls
  urls=u if isinstance(u,list) and len(u) else ["https://www.doubao.com/chat/"]
  return ensure_chrome_debug(urls=urls)

@router.post("/restart")
def restart_zero_token():
  stop()
  d=ensure_running(timeout_sec=10.0)
  return {"ok":True,"status":d}

@router.get("/status")
def zero_token_status():
  return status()

@router.post("/deepseek/webauth/start",response_model=StartResp)
def start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log, urls=["https://chat.deepseek.com/"])
      _S[i]["result"]=deepseek_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/deepseek/webauth/start",response_model=StartResp)
def start_webauth_get(): return start_webauth()

@router.get("/deepseek/webauth/{id}",response_model=StatusResp)
def status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/deepseek/chrome-debug")
def start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://chat.deepseek.com/"])
  return {"pid":pid}

@router.get("/deepseek/chrome-debug")
def start_chrome_debug_get(): return start_chrome_debug()

@router.post("/doubao/webauth/start",response_model=StartResp)
def doubao_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=doubao_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/doubao/webauth/start",response_model=StartResp)
def doubao_start_webauth_get(): return doubao_start_webauth()

@router.get("/doubao/webauth/{id}",response_model=StatusResp)
def doubao_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/doubao/chrome-debug")
def doubao_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://www.doubao.com/chat/"])
  return {"pid":pid}

@router.get("/doubao/chrome-debug")
def doubao_start_chrome_debug_get(): return doubao_start_chrome_debug()

@router.post("/claude/webauth/start",response_model=StartResp)
def claude_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=claude_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/claude/webauth/start",response_model=StartResp)
def claude_start_webauth_get(): return claude_start_webauth()

@router.get("/claude/webauth/{id}",response_model=StatusResp)
def claude_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/claude/chrome-debug")
def claude_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://claude.ai/"])
  return {"pid":pid}

@router.get("/claude/chrome-debug")
def claude_start_chrome_debug_get(): return claude_start_chrome_debug()

@router.post("/qwen/webauth/start",response_model=StartResp)
def qwen_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=qwen_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/qwen/webauth/start",response_model=StartResp)
def qwen_start_webauth_get(): return qwen_start_webauth()

@router.get("/qwen/webauth/{id}",response_model=StatusResp)
def qwen_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/qwen/chrome-debug")
def qwen_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://chat.qwen.ai/"])
  return {"pid":pid}

@router.get("/qwen/chrome-debug")
def qwen_start_chrome_debug_get(): return qwen_start_chrome_debug()

@router.post("/qwen-cn/webauth/start",response_model=StartResp)
def qwen_cn_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=qwen_cn_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/qwen-cn/webauth/start",response_model=StartResp)
def qwen_cn_start_webauth_get(): return qwen_cn_start_webauth()

@router.get("/qwen-cn/webauth/{id}",response_model=StatusResp)
def qwen_cn_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/qwen-cn/chrome-debug")
def qwen_cn_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://www.qianwen.com/"])
  return {"pid":pid}

@router.get("/qwen-cn/chrome-debug")
def qwen_cn_start_chrome_debug_get(): return qwen_cn_start_chrome_debug()

@router.post("/kimi/webauth/start",response_model=StartResp)
def kimi_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=kimi_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/kimi/webauth/start",response_model=StartResp)
def kimi_start_webauth_get(): return kimi_start_webauth()

@router.get("/kimi/webauth/{id}",response_model=StatusResp)
def kimi_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/kimi/chrome-debug")
def kimi_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://www.kimi.com/"])
  return {"pid":pid}

@router.get("/kimi/chrome-debug")
def kimi_start_chrome_debug_get(): return kimi_start_chrome_debug()

@router.post("/chatgpt/webauth/start",response_model=StartResp)
def chatgpt_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=chatgpt_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/chatgpt/webauth/start",response_model=StartResp)
def chatgpt_start_webauth_get(): return chatgpt_start_webauth()

@router.get("/chatgpt/webauth/{id}",response_model=StatusResp)
def chatgpt_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/chatgpt/chrome-debug")
def chatgpt_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://chatgpt.com/"])
  return {"pid":pid}

@router.get("/chatgpt/chrome-debug")
def chatgpt_start_chrome_debug_get(): return chatgpt_start_chrome_debug()

@router.post("/gemini/webauth/start",response_model=StartResp)
def gemini_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=gemini_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/gemini/webauth/start",response_model=StartResp)
def gemini_start_webauth_get(): return gemini_start_webauth()

@router.get("/gemini/webauth/{id}",response_model=StatusResp)
def gemini_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/gemini/chrome-debug")
def gemini_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://gemini.google.com/app"])
  return {"pid":pid}

@router.get("/gemini/chrome-debug")
def gemini_start_chrome_debug_get(): return gemini_start_chrome_debug()

@router.post("/glm/webauth/start",response_model=StartResp)
def glm_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=glm_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/glm/webauth/start",response_model=StartResp)
def glm_start_webauth_get(): return glm_start_webauth()

@router.get("/glm/webauth/{id}",response_model=StatusResp)
def glm_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/glm/chrome-debug")
def glm_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://chatglm.cn"])
  return {"pid":pid}

@router.get("/glm/chrome-debug")
def glm_start_chrome_debug_get(): return glm_start_chrome_debug()

@router.post("/glm-intl/webauth/start",response_model=StartResp)
def glm_intl_start_webauth():
  i=str(uuid.uuid4());_S[i]={"status":"running","log":[],"result":None,"error":None}
  def log(x:str): _S[i]["log"].append(x)
  def run():
    try:
      ensure_chrome_debug(progress=log)
      _S[i]["result"]=glm_intl_webauth(progress=log);_S[i]["status"]="done"
    except Exception as e:
      _S[i]["status"]="error";_S[i]["error"]=str(e)
  threading.Thread(target=run,daemon=True).start()
  return {"id":i}

@router.get("/glm-intl/webauth/start",response_model=StartResp)
def glm_intl_start_webauth_get(): return glm_intl_start_webauth()

@router.get("/glm-intl/webauth/{id}",response_model=StatusResp)
def glm_intl_status_webauth(id:str):
  if id not in _S: raise HTTPException(status_code=404,detail="not found")
  return _S[id]

@router.post("/glm-intl/chrome-debug")
def glm_intl_start_chrome_debug():
  pid=launch_chrome_debug(urls=["https://chat.z.ai/"])
  return {"pid":pid}

@router.get("/glm-intl/chrome-debug")
def glm_intl_start_chrome_debug_get(): return glm_intl_start_chrome_debug()

