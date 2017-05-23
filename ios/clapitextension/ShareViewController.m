//
//  ShareViewController.m
//  clapitextension
//
//  Created by Elijah Windsor on 4/11/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "ShareViewController.h"
#import "RCTRootView.h"
#import "AppHub.h"
#import "../Pods/Kochava/TrackAndAd.h"

@import AVFoundation;
@import AVKit;
@import MobileCoreServices;


@interface ShareViewController ()

@property (strong, nonatomic) RCTRootView *rootView;

@end

@implementation ShareViewController
@synthesize kochavaTracker;

- (void)viewDidLoad {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(closeExtension:) name:@"closeExtension" object:nil];
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(showLoginNeeded:) name:@"showLoginNeeded" object:nil];
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(showUploadError:) name:@"showUploadError" object:nil];
  
  NSDictionary *initDict = [NSDictionary dictionaryWithObjectsAndKeys:
                            @"koclapit-2ait", @"kochavaAppId",
                            @"1", @"enableLogging",
                            nil];
  kochavaTracker = [[KochavaTracker alloc] initKochavaWithParams:initDict];
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)closeExtension:(NSNotification *)notification {
  [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
}

- (void)showLoginNeeded:(NSNotificationCenter *)notification {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Login"
                                                                   message:@"Please login first through you clapit App"  // TODO: fix
                                                            preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *ok = [UIAlertAction
                         actionWithTitle:@"OK"
                         style:UIAlertActionStyleDefault
                         handler:^(UIAlertAction *action)
                         {
                           [alert dismissViewControllerAnimated:YES completion:nil];
                           
                           [self closeExtension:nil];
                         }];
    [alert addAction:ok];
    [self presentViewController:alert animated:YES completion:nil];
  });
}

- (void)showUploadError:(NSNotification *)notification {
  dispatch_async(dispatch_get_main_queue(), ^{

    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Upload"
                                                                   message:@"We were having trouble reaching the server just now.  Please try again later."
                                                            preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *ok = [UIAlertAction
                         actionWithTitle:@"OK"
                         style:UIAlertActionStyleDefault
                         handler:^(UIAlertAction *action)
                         {
                           [alert dismissViewControllerAnimated:YES completion:nil];
                         }];
    [alert addAction:ok];
    [self presentViewController:alert animated:YES completion:nil];
  });
}

- (void)loadView {
  NSURL *jsCodeLocation;

  NSDictionary *initialProperties;
  
  NSString *groupIdentifier = @"group.com.clapit.Clapit";
  

#ifdef APPHUB
  [AppHub buildManager].debugBuildsEnabled = YES;
  [AppHub setApplicationID:@"Vjok55qv7ovFHRSsv9rL"];
  groupIdentifier = @"group.com.clapit.ClapitTest";
#else 
  [AppHub setApplicationID:@"ziXyQhFYZYs6V9FaQXYw"];
#endif

//uncomment this to test release builds without being rewritten by apphub builds
//[AppHub buildManager].automaticPollingEnabled = NO;

#ifdef DEBUG
  jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
  initialProperties = @{@"production":[NSNumber numberWithBool:NO], @"debug":[NSNumber numberWithBool:YES]};
#else
  AHBuild *build = [[AppHub buildManager] currentBuildForGroupIdentifier:groupIdentifier];
  jsCodeLocation = [build.bundle URLForResource:@"main" withExtension:@"jsbundle"];
  
  initialProperties = @{@"production":[NSNumber numberWithBool:YES], @"debug":[NSNumber numberWithBool:NO]};
#endif

  
  self.rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ClapitExtension"
                                               initialProperties:initialProperties
                                                   launchOptions:nil];

  
  [self.rootView setBackgroundColor:[UIColor clearColor]];
  self.view = self.rootView;
  
  NSItemProvider *itemProvider = [self getSupportedTypeOrFirstObj:self.extensionContext.inputItems];
  __weak typeof(self) weakSelf = self;
  
  if ([itemProvider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeURL]) {
    [itemProvider loadItemForTypeIdentifier:(NSString *)kUTTypeURL options:nil completionHandler:^(NSURL *url, NSError *error) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf assignShareType:@"url" andData:@{@"url": [url absoluteString]}];

      });
    }];
  } else if ([itemProvider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeImage]) {
    [itemProvider loadItemForTypeIdentifier:(NSString *)kUTTypeImage options:nil completionHandler:^(UIImage *image, NSError *error) {
      if (!error && image) {
        dispatch_async(dispatch_get_main_queue(), ^{
          NSDictionary *imageDic = [weakSelf saveTmpImage:image];
          NSString *imagePath = imageDic[@"image"];
          NSString *imageOrientation = imageDic[@"orientation"];
          
          [weakSelf assignShareType:@"image" andData:@{@"image": imagePath, @"orientation": imageOrientation}];
        });
      }
    }];
  } else if ([itemProvider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeMovie]) {
    [itemProvider loadItemForTypeIdentifier:(NSString *)kUTTypeMovie options:nil completionHandler:^(NSURL *url, NSError *error) {
      if(!error && url) {
        AVURLAsset *asset = [[AVURLAsset alloc] initWithURL:url options:nil];
        AVAssetImageGenerator *generator = [[AVAssetImageGenerator alloc] initWithAsset:asset];
        generator.appliesPreferredTrackTransform = true;
        CMTime thumbTime = CMTimeMakeWithSeconds(0, 1);     // 0 seconds into the video
        AVAssetImageGeneratorCompletionHandler handler = ^(CMTime requestedTime, CGImageRef imageRef, CMTime actualTime, AVAssetImageGeneratorResult result, NSError *error){
          if (result != AVAssetImageGeneratorSucceeded) {
            dispatch_async(dispatch_get_main_queue(), ^{
              //TODO
            });
            return;
          } else {
            UIImage *frameImage = [UIImage imageWithCGImage:imageRef];
            dispatch_async(dispatch_get_main_queue(), ^{
              
              NSDictionary *imageDic = [weakSelf saveTmpImage:frameImage];
              
              NSString *imagePath = imageDic[@"image"];
              NSString *imageOrientation = imageDic[@"orientation"];
              
              [weakSelf assignShareType:@"video" andData:@{@"image": imagePath, @"orientation": imageOrientation, @"video": [url path]}];

            });
            
          }
        };
        [generator generateCGImagesAsynchronouslyForTimes:[NSArray arrayWithObject:[NSValue valueWithCMTime:thumbTime]] completionHandler:handler];

      }
    }];
  }
}

- (void)assignShareType:(NSString *)shareType andData:(NSDictionary *)data {

  #ifdef DEBUG
    NSDictionary *propertiesDic = [NSDictionary dictionaryWithObjectsAndKeys:@YES, @"isExtension", shareType, @"shareType", data, @"data", @NO, @"production", @YES, @"debug", nil];
    self.rootView.appProperties = propertiesDic;
  #else
    NSDictionary *propertiesDic = [NSDictionary dictionaryWithObjectsAndKeys:@YES, @"isExtension", shareType, @"shareType", data, @"data", @YES, @"production", @NO, @"debug", nil];
    self.rootView.appProperties = propertiesDic;
  #endif

}

- (NSDictionary *)saveTmpImage:(UIImage *)image {
  NSURL *tmpDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
  NSURL *fileURL = [[tmpDirURL URLByAppendingPathComponent:@"clapit-share"] URLByAppendingPathExtension:@"jpg"];
  
  NSString *orientation = @"portrait";
  
  switch(image.imageOrientation) {
    case UIImageOrientationUp:
    case UIImageOrientationDown:
    case UIImageOrientationUpMirrored:
    case UIImageOrientationDownMirrored:
      orientation = @"landscape";
      break;
    default:
      orientation = @"portrait";
      break;
  }
  
  UIImage *scaledImage = [UIImage imageWithCGImage:image.CGImage scale:image.scale * 2.0 orientation:image.imageOrientation];
  NSData *data = [NSData dataWithData:UIImageJPEGRepresentation(scaledImage, 0.7)];
  
  [data writeToFile:[fileURL path] atomically:YES];
  
  return @{@"image": [fileURL path], @"orientation": orientation};
}


// copied from old cod
-(NSItemProvider *)getSupportedTypeOrFirstObj:(NSArray *)inputItems {
  NSItemProvider *urlProvider = nil;
  NSItemProvider *imageProvider = nil;
  NSItemProvider *videoProvider = nil;
  for (NSExtensionItem *item in inputItems) {
    for (id provider in item.attachments) {
      if ([provider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeURL]) {
        urlProvider = provider;
        break;
      } else if ([provider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeImage]) {
        imageProvider = provider;
      } else if ([provider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeMovie]) {
        videoProvider = provider;
      }
    }
  }
  
  if (urlProvider) {
    return urlProvider;
  } else if (imageProvider) {
    
    return imageProvider;
  } else if (videoProvider) {
    return videoProvider;
  } else {
    NSExtensionItem *item = self.extensionContext.inputItems.firstObject;
    return item.attachments.firstObject;
  }
}


@end
