//
// Created by Roman Mandryk on 21/06/2016.
//

#import "KochavaWrapper.h"
#import "../Pods/Kochava/TrackAndAd.h"


@implementation KochavaWrapper

@synthesize kochavaTracker;

// track event
RCT_EXPORT_METHOD(trackEvent:(NSString *)eventTitle eventValue:(NSString*)eventValue) {
    [kochavaTracker trackEvent:eventTitle :eventValue];
}

// init
RCT_EXPORT_METHOD(initWithKochavaAppId:(NSString *)appId) {
  NSDictionary *initDict = [NSDictionary dictionaryWithObjectsAndKeys:
                              appId, @"kochavaAppId",
                              @"1", @"enableLogging",
                              nil];
  kochavaTracker = [[KochavaTracker alloc] initKochavaWithParams:initDict];
}


RCT_EXPORT_MODULE();
@end