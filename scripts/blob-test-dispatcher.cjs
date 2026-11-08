const {Agent,setGlobalDispatcher}=require(process.cwd()+'/node_modules/undici');
const agent=new Agent();
setGlobalDispatcher({dispatch(options,handler){
 if(String(options.origin)==='https://mockstore.private.blob.vercel-storage.com')return agent.dispatch({...options,origin:'http://127.0.0.1:9444',path:'/read'+options.path},handler);
 return agent.dispatch(options,handler);
},close:()=>agent.close(),destroy:()=>agent.destroy()});
