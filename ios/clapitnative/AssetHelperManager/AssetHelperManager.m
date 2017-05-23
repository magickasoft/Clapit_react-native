//
//  NormalizeImageManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/15/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "AssetHelperManager.h"
#import <UIKit/UIKit.h>
#import <ImageIO/ImageIO.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation AssetHelperManager

RCT_EXPORT_METHOD(getAssetLibraryOrientation:(NSString *)assetPath callback:(RCTResponseSenderBlock)callback) {
  
  NSURL *assetUrl = [[NSURL alloc] initWithString:assetPath];
  ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
  [library assetForURL:assetUrl resultBlock:^(ALAsset *asset) {
    
    ALAssetRepresentation *rep = [asset defaultRepresentation];

    NSString *orientation;
    
    switch([rep orientation]) {
      case ALAssetOrientationUp:
      case ALAssetOrientationDown:
      case ALAssetOrientationUpMirrored:
      case ALAssetOrientationDownMirrored:
        orientation = @"landscape";
        break;
      default:
        orientation = @"portrait";
        break;
    }

    callback(@[[NSNull null], orientation]);
  } failureBlock:^(NSError *error) {
    
    callback(@[[NSNull null], @"landscape"]);
  }];
  
}

RCT_EXPORT_METHOD(saveTmpImage:(NSString *)imagePath callback:(RCTResponseSenderBlock)callback) {
  
  if( [imagePath hasPrefix:@"assets-library:"] ) {
    NSURL *assetUrl = [[NSURL alloc] initWithString:imagePath];
    ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    [library assetForURL:assetUrl resultBlock:^(ALAsset *asset) {
    
      ALAssetRepresentation *rep = [asset defaultRepresentation];
    
      CGImageRef fullScreenImageRef = [rep fullScreenImage];
    
      UIImage *image = [UIImage imageWithCGImage:fullScreenImageRef scale:[rep scale] * 2 orientation:UIImageOrientationUp];
    
      NSURL *tmpDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
      NSURL *fileURL = [[tmpDirURL URLByAppendingPathComponent:@"clapit-share"] URLByAppendingPathExtension:@"jpg"];
    
      NSString *orientation = @"portrait";
    
      switch([rep orientation]) {
        case ALAssetOrientationUp:
        case ALAssetOrientationDown:
        case ALAssetOrientationUpMirrored:
        case ALAssetOrientationDownMirrored:
          orientation = @"landscape";
          break;
        default:
          orientation = @"portrait";
          break;
      }
    
      NSData *data = [NSData dataWithData:UIImageJPEGRepresentation(image, 1.0)];
    
      [data writeToFile:[fileURL path] atomically:YES];
    
      callback(@[[NSNull null], @{@"image": [fileURL path], @"orientation": orientation}]);
    
    } failureBlock:^(NSError *error) {
      NSLog(@"%@", error);
    }];
  }
  else {
    UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
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
    
    callback(@[[NSNull null], @{@"image": [fileURL path], @"orientation": orientation}]);
  }

}

RCT_EXPORT_METHOD(getThumbnailImageForVideo:(NSString *)videoPath callback:(RCTResponseSenderBlock)callback) {
  
  if( [videoPath hasPrefix:@"assets-library:"] ) {
    NSURL *assetUrl = [[NSURL alloc] initWithString:videoPath];
    ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    [library assetForURL:assetUrl resultBlock:^(ALAsset *asset) {
    
      ALAssetRepresentation *rep = [asset defaultRepresentation];
      CGSize dimensions = [rep dimensions];

      NSString *orientation = @"portrait";
      if(dimensions.height < dimensions.width) {
        orientation = @"landscape";
      }
    

      // Get URL from ALAsset* asset:
      NSURL* assetURL = [asset valueForProperty:ALAssetPropertyAssetURL];
    
      AVAsset* avAsset = [[AVURLAsset alloc] initWithURL:assetURL options:nil];

      AVAssetImageGenerator *generator = [[AVAssetImageGenerator alloc] initWithAsset:avAsset];
      generator.appliesPreferredTrackTransform = true;

      CGImageRef imgRef = [generator copyCGImageAtTime:CMTimeMakeWithSeconds(0, 1) actualTime:NULL error:nil];
      UIImage* image = [UIImage imageWithCGImage:imgRef];
    

      NSURL *tmpDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
      NSURL *fileURL = [[tmpDirURL URLByAppendingPathComponent:@"clapit-share"] URLByAppendingPathExtension:@"jpg"];
    
      NSData *data = [NSData dataWithData:UIImageJPEGRepresentation(image, 1.0)];
    
      [data writeToFile:[fileURL path] atomically:YES];

    
      dispatch_async(dispatch_get_main_queue(), ^{
        callback(@[[NSNull null], @{@"image": [fileURL path], @"orientation": orientation}]);
      });
    } failureBlock:^(NSError *error) {
      NSLog(@"Error: %@", error);
    }];
  }
  else {
    AVAsset *asset = [AVURLAsset assetWithURL:[NSURL fileURLWithPath:videoPath]];
    AVAssetImageGenerator *imageGenerator = [[AVAssetImageGenerator alloc]initWithAsset:asset];
    imageGenerator.appliesPreferredTrackTransform = YES;
    CMTime duration = asset.duration;
    CGFloat durationInSeconds = duration.value / duration.timescale;
    CMTime time = CMTimeMakeWithSeconds(0, (int)duration.value);
    CGImageRef imageRef = [imageGenerator copyCGImageAtTime:time actualTime:NULL error:NULL];
    UIImage *image = [UIImage imageWithCGImage:imageRef];
    CGImageRelease(imageRef);
   
    NSString *orientation = @"portrait";
    if(image.size.height < image.size.width) {
      orientation = @"landscape";
    }
    
    NSURL *tmpDirURL = [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
    NSURL *fileURL = [[tmpDirURL URLByAppendingPathComponent:@"clapit-share"] URLByAppendingPathExtension:@"jpg"];
    
    NSData *data = [NSData dataWithData:UIImageJPEGRepresentation(image, 1.0)];
    
    [data writeToFile:[fileURL path] atomically:YES];
    
    
    dispatch_async(dispatch_get_main_queue(), ^{
      callback(@[[NSNull null], @{@"image": [fileURL path], @"orientation": orientation}]);
    });
    
  }
}


RCT_EXPORT_METHOD(createGif:(NSString *)imagePath
                  imagePath2:(NSString *)imagePath2
                  imagePath3:(NSString *)imagePath3
                  imagePath4:(NSString *)imagePath4
                  imagePath5:(NSString *)imagePath5
                  callback:(RCTResponseSenderBlock)callback) {
    UIImage *image1 = [UIImage imageWithContentsOfFile:imagePath];
    UIImage *image2 = [UIImage imageWithContentsOfFile:imagePath2];
    UIImage *image3 = [UIImage imageWithContentsOfFile:imagePath3];
    UIImage *image4 = [UIImage imageWithContentsOfFile:imagePath4];
    UIImage *image5 = [UIImage imageWithContentsOfFile:imagePath5];
    image1 = [self cropAndResizeImage:image1 ];
    image2 = [self cropAndResizeImage:image2 ];
    image3 = [self cropAndResizeImage:image3 ];
    image4 = [self cropAndResizeImage:image4 ];
    image5 = [self cropAndResizeImage:image5 ];
  
    NSString *orientation = @"portrait";
    switch(image1.imageOrientation) {
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
  //from https://gist.github.com/akisute/1141953
  NSString *path = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject]
                    stringByAppendingPathComponent:[[[NSUUID UUID] UUIDString]
                                                    stringByAppendingPathExtension:@"gif" ]];
  CGImageDestinationRef destination = CGImageDestinationCreateWithURL((CFURLRef)[NSURL fileURLWithPath:path],
                                                                      kUTTypeGIF,
                                                                      5,
                                                                      NULL);
  
  NSDictionary *frameProperties = [NSDictionary dictionaryWithObject:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:0.4] forKey:(NSString *)kCGImagePropertyGIFDelayTime]
                                                              forKey:(NSString *)kCGImagePropertyGIFDictionary];
  NSDictionary *gifProperties = [NSDictionary dictionaryWithObject:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:0] forKey:(NSString *)kCGImagePropertyGIFLoopCount]
                                                            forKey:(NSString *)kCGImagePropertyGIFDictionary];
  
  CGImageDestinationAddImage(destination, image1.CGImage, (CFDictionaryRef)frameProperties);
  CGImageDestinationAddImage(destination, image2.CGImage, (CFDictionaryRef)frameProperties);
  CGImageDestinationAddImage(destination, image3.CGImage, (CFDictionaryRef)frameProperties);
  CGImageDestinationAddImage(destination, image4.CGImage, (CFDictionaryRef)frameProperties);
  CGImageDestinationAddImage(destination, image5.CGImage, (CFDictionaryRef)frameProperties);
  CGImageDestinationSetProperties(destination, (CFDictionaryRef)gifProperties);
  CGImageDestinationFinalize(destination);
  CFRelease(destination);
 
  callback(@[[NSNull null], @{@"image": path, @"orientation": orientation}]);
  
  
}

- (UIImage *)cropAndResizeImage:(UIImage *)image
{
  CGFloat imageWidth = image.size.width;
  CGFloat imageHeight = image.size.height;
  // figure out where to start on the Y-axis
  CGFloat startY = (imageHeight - imageWidth) / 2.0f;
  
  CGRect cropRect = (CGRect){0, startY, imageWidth, imageWidth};
  
  UIImage *croppedImage = [self croppedImage:image inRect:cropRect];
  croppedImage = [self resizeImage:croppedImage width:100 height:100];
  return croppedImage;
}

- (UIImage *)croppedImage:(UIImage *)image inRect:(CGRect)rect
{
  double (^rad)(double) = ^(double deg) {
    return deg / 180.0 * M_PI;
  };
  
  CGAffineTransform rectTransform;
  switch (image.imageOrientation) {
    case UIImageOrientationLeft:
      rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(90)), 0, -image.size.height);
      break;
    case UIImageOrientationRight:
      rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(-90)), -image.size.width, 0);
      break;
    case UIImageOrientationDown:
      rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(-180)), -image.size.width, -image.size.height);
      break;
    default:
      rectTransform = CGAffineTransformIdentity;
  };
  rectTransform = CGAffineTransformScale(rectTransform, image.scale, image.scale);
  
  CGImageRef imageRef = CGImageCreateWithImageInRect([image CGImage], CGRectApplyAffineTransform(rect, rectTransform));
  UIImage *result = [UIImage imageWithCGImage:imageRef scale:image.scale orientation:image.imageOrientation];
  CGImageRelease(imageRef);
  
  return result;
}

- (UIImage *)resizeImage:(UIImage *)image width:(CGFloat)width height:(CGFloat)height {
  CGSize scaleSize = CGSizeMake(width, height);
  UIGraphicsBeginImageContextWithOptions(scaleSize, NO, 0.0);
  [image drawInRect:CGRectMake(0, 0, scaleSize.width, scaleSize.height)];
  UIImage * resizedImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  return resizedImage;
}

RCT_EXPORT_MODULE();

@end
