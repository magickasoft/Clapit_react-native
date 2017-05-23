
#import "Mixpanel/MPTweakInline.h"
#import "MixpanelManager.h"
#import "AppDelegate.h"
#import "MPTweakStore.h"

@implementation MixpanelManager

RCT_EXPORT_METHOD(getTweakValue:(NSString *)name
                  callback:(RCTResponseSenderBlock)callback) {

  NSDictionary* ABTests = @{
                            @"testing": MPTweakValue(@"testing", @"ok"),
                            @"BestFeedAlgo": MPTweakValue(@"BestFeedAlgo", @"1"),
                            @"HidePosts": MPTweakValue(@"HidePosts", @"0")
                           };
  
  dispatch_async(dispatch_get_main_queue(), ^{
    callback(@[[NSNull null], ABTests[name]]);
  });
}


RCT_EXPORT_MODULE();

@end
