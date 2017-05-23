//
//  ImageCropper.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/6/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "ImageCropperManager.h"
#import <AssetsLibrary/AssetsLibrary.h>

@implementation ImageCropperManager

RCT_EXPORT_METHOD(makeSquareJpg:(NSString *)imagePath callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if( [imagePath hasPrefix:@"assets-library:"] ) {
      NSURL *assetURL = [[NSURL alloc] initWithString:imagePath];
      ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
      [library assetForURL:assetURL resultBlock:^(ALAsset *asset) {
        ALAssetRepresentation *rep = [asset defaultRepresentation];
        CGImageRef fullScreenImageRef = [rep fullScreenImage];
        UIImage *image = [UIImage imageWithCGImage:fullScreenImageRef];
        [self processImage:image callback:callback];
      } failureBlock:^(NSError *error) {
        NSLog(@"Getting file from library failed: %@", error);
        callback(@[@"Getting file from library failed", [NSNull null]]);
      }];
    }
    else {
      UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
      [self processImage:image callback:callback];
    }
  });
}

- (void)processImage:(UIImage *)image callback:(RCTResponseSenderBlock)callback
{
  CGFloat imageWidth = image.size.width;
  CGFloat imageHeight = image.size.height;
  // figure out where to start on the Y-axis
  CGFloat startY = (imageHeight - imageWidth) / 2.0f;
  
  CGRect cropRect = (CGRect){0, startY, imageWidth, imageWidth};
  
  UIImage *croppedImage = [self croppedImage:image inRect:cropRect];
  NSData * croppedImageData = UIImageJPEGRepresentation(croppedImage, 0.7);
  
  // Taken from RCTCameraManager
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths firstObject];
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSString *fullPath = [[documentsDirectory stringByAppendingPathComponent:[[NSUUID UUID] UUIDString]] stringByAppendingPathExtension:@"jpg"];
  
  [fileManager createFileAtPath:fullPath contents:croppedImageData attributes:nil];
  
  callback(@[[NSNull null], fullPath]);
}


RCT_EXPORT_METHOD(resizeJpg:(NSString *)imagePath width:(CGFloat)width height:(CGFloat)height callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
    UIImage *scaledImage = [self scaleToSize:image width:width height:height];
    NSData * scaledImageData = UIImageJPEGRepresentation(scaledImage, 0.5);
    // Taken from RCTCameraManager
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths firstObject];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSString *fullPath = [[documentsDirectory stringByAppendingPathComponent:[[NSUUID UUID] UUIDString]] stringByAppendingPathExtension:@"jpg"];
    [fileManager createFileAtPath:fullPath contents:scaledImageData attributes:nil];
    callback(@[[NSNull null], fullPath]);
  });
}

- (void)resizeJpgAndCompress:(UIImage *)image width:(CGFloat)width height:(CGFloat)height callback:(RCTResponseSenderBlock)callback
{
  UIImage *scaledImage = [self scaleToSize:image width:width height:height];
  NSData * scaledImageData = UIImageJPEGRepresentation(scaledImage, 0.5);
  // Taken from RCTCameraManager
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths firstObject];
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSString *fullPath = [[documentsDirectory stringByAppendingPathComponent:[[NSUUID UUID] UUIDString]] stringByAppendingPathExtension:@"jpg"];
  [fileManager createFileAtPath:fullPath contents:scaledImageData attributes:nil];
  callback(@[[NSNull null], fullPath]);
}


RCT_EXPORT_METHOD(convertToJpgAndCompress:(NSString *)imagePath width:(CGFloat)width height:(CGFloat)height callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if( [imagePath hasPrefix:@"assets-library:"] ) {
      NSURL *assetURL = [[NSURL alloc] initWithString:imagePath];
      ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
      [library assetForURL:assetURL resultBlock:^(ALAsset *asset) {
        ALAssetRepresentation *rep = [asset defaultRepresentation];
        CGImageRef fullScreenImageRef = [rep fullScreenImage];
        UIImage *image = [UIImage imageWithCGImage:fullScreenImageRef];
        [self resizeJpgAndCompress:image width:800 height:600 callback:callback];
      } failureBlock:^(NSError *error) {
        NSLog(@"Getting file from library failed: %@", error);
        callback(@[@"Getting file from library failed", [NSNull null]]);
      }];
    }
    else {
      UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
      [self resizeJpgAndCompress:image width:width height:height callback:callback];
    }
  });
}


- (UIImage*)scaleToSize:(UIImage *)image width:(CGFloat)width height:(CGFloat)height {
  CGSize sacleSize = CGSizeMake(width, height);
  UIGraphicsBeginImageContextWithOptions(sacleSize, NO, 0.0);
  [image drawInRect:CGRectMake(0, 0, sacleSize.width, sacleSize.height)];
  UIImage * resizedImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  return resizedImage;
}

// taken from: http://stackoverflow.com/questions/158914/cropping-an-uiimage
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

RCT_EXPORT_MODULE();

@end
