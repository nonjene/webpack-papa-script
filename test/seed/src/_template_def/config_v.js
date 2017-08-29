try{
    window.publicConfig.mode = "produce";
    window.publicConfig.debug = false;
    Object.freeze(window.publicConfig);
}catch(e){}