export function distanceFromEnd(event): number {
    let {
      contentSize,
      contentInset,
      contentOffset,
      layoutMeasurement,
    } = event.nativeEvent;

    contentLength = contentSize.height;
    trailingInset = contentInset.bottom;
    scrollOffset = contentOffset.y;
    viewportLength = layoutMeasurement.height;

    return contentLength + trailingInset - scrollOffset - viewportLength;
}
