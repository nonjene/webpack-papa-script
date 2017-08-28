try{
    window.publicConfig.mode = "test";
    window.publicConfig.debug = true;
    Object.freeze(window.publicConfig);
}catch(e){}