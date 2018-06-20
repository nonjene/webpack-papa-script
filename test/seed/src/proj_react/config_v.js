try{
      Object.assign(window.publicConfig, {
        mode:"test",
        debug:true
      });
      Object.freeze(window.publicConfig);
    }catch(e){}