//
//  ShareViewController.h
//  clapitextension
//
//  Created by Elijah Windsor on 4/11/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "../Pods/Kochava/TrackAndAd.h"

@interface ShareViewController : UIViewController
@property(readonly) KochavaTracker *kochavaTracker;
@end
