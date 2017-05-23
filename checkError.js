var sourceMap = require('source-map');
var fs = require('fs');

//README: paste the error into errStr variable
var errStr = "Unhandled JS Exception: undefined is not an object (evaluating 't.id'), stack: value@564:2287 onFollowingPressed@564:5084 onPress@565:1440 touchableHandlePress@287:1169 _performSideEffectsForTransition@268:8162 _receiveSignal@268:6671 touchableHandleResponderRelease@268:4157 a@101:72 o@98:391 a@98:582 f@95:161 g@95:264 i@104:88 processEventQueue@95:1384 s@154:92 handleTopLevel@154:181 _receiveRootNodeIDEvent@153:614 receiveTouches@153:996 value@25:3099 <unknown>@25:1318 k@25:412 value@25:1290"

fs.readFile('./sourcemap.js', 'utf8', function (err, data) {
  var smc = new sourceMap.SourceMapConsumer(data);

  const errWithActual = errStr.split('@').map(st => {
    if(/[\d+]:[\d+]/.test(st)){
      const [line, column] = st.split(' ')[0].split(':')

      const actual = smc.originalPositionFor({ line, column });
      st = actual.source + ' ' + actual.line + ':' + actual.column + '\n' + st.split(' ')[1]
    }

    return st;
  }).join(' ')

  console.log(errWithActual);
});