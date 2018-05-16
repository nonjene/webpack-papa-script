try{
      Object.assign(window.publicConfig, {
        mode:"produce",
        debug:false
      });
      Object.freeze(window.publicConfig);
    }catch(e){}