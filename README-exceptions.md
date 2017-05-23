This file is to track exceptions and notes required to run the project. The goal is to keep this file empty:)
    
- mixpanel library is not initialized in share extension. All mixpanel calls which could be made from within extension need to be checked for undefined:


    `if (Mixpanel){
    `        Mixpanel.track("Create Post");
    `}
