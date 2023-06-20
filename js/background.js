import {
  debugLogger, storageSettingMap, request, lookUp, checkWordAdded,
  addOrForget, getWordExampleSentence, 
} from './const.js'


/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
// async function NewPlaySound(source = 'default.wav', volume = 1) {
//   await createOffscreen();
//   await chrome.runtime.sendMessage({ play: { source, volume } });
// }

// Create the offscreen document if it doesn't already exist

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'testing' // details for using the API
  });
}



const storage = {}
/*=====================使用web音频接口播放音频的方法==================*/
const playSound = url => {
  console.log("DoPlaySound");

  request(url, {type: 'buffer'}).then(r => {
    console.log("Get Url: ", url);

    console.log('offscreen', chrome.offscreen);

    createOffscreen().then(()=>{
      console.log("create done!");

      // let source = url;
      // let volume = 50;
      // chrome.runtime.sendMessage({ play: { source, volume } }).then(()=> {
      //   console.log('send done!')
      // })

      let action = 'playSound';
      const target = 'offscreen';
      chrome.runtime.sendMessage({action, target, url}).then(()=>{
        console.log("background.js send message!")
      })
    })
    // const context = new AudioContext()
    // context.decodeAudioData(r, function (buffer) {
    //   const source = context.createBufferSource()
    //   source.buffer = buffer
    //   source.connect(context.destination)
    //   source.start(0)
    // })


  })

}
/*=================================================================*/

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  console.log("req: ", req)
  switch (req.action) {
    case 'lookup':
      lookUp(req.word)
        .then(res => checkWordAdded(res.id).then(existsRes => {res.exists = existsRes.objects[0].exists; return res}))
        .then(data => chrome.tabs.sendMessage(sender.tab.id, {action: 'lookup', data}))
        .catch(data => chrome.tabs.sendMessage(sender.tab.id, {action: 'lookup', data}))
      break
    case 'addOrForget':
      addOrForget(req.word, req.wordID).then(res => {
        chrome.tabs.sendMessage(sender.tab.id, {action: 'addOrForget', data: res})
      })
      break
    case 'getWordExample':
      getWordExampleSentence(req.id)
        .then(data => chrome.tabs.sendMessage(sender.tab.id, {action: 'getWordExample', data}))
      break
    case 'playSound':
      playSound(req.url)
      break
    case 'getAuthInfo':
      chrome.cookies.getAll({domain: 'shanbay.com', name: 'auth_token'}, cookies => {
        console.log('request getAuthInfo', cookies)
        sendResponse((cookies[0] || {}).value)
      })
      break
    default:
      throw Error('Invalid action type')
  }
  return true
})

  /**
   * 每3小时检测一下今天的剩余单词数量, 必须登录扇贝之后才可以使用
   * @function getDailyTask
   * */
const getDailyTask = () => {
  const reminderName = 'remindAlarm'
  if (storage.alarm) {
    chrome.alarms.create(reminderName, {
      delayInMinutes: 60,
      periodInMinutes: 180
    })
    chrome.alarms.onAlarm.addListener(() => {
      if (!storage.alarm) return chrome.alarms.clear(reminderName)
      debugLogger('log', 'send daily task request')
      request('https://www.shanbay.com/api/v1/bdc/stats/today/').then(r => {

        if (r.data.num_left === 0) {
          chrome.action.setBadgeText({text: ''})
        } else {
          chrome.action.setBadgeText({text: r.data.num_left + ''})
          notify({
            message: `今天还有${r.data.num_left}个单词需要复习`,
            url: 'https://www.shanbay.com/bdc/review/'
          })
        }
      }).catch(e => debugLogger('error', 'get daily task failed, cause: ', e))
    })
  } else {
    chrome.alarms.clear(reminderName)
  }
}

chrome.storage.onChanged.addListener(changes => {
  console.log("changes", changes);

  const settings = changes.__shanbayExtensionSettings.newValue
  if (Object.keys(settings).length) {
    settings.forEach(item => {
      Object.assign(storage, item)
    })
  }
  getDailyTask()
})

chrome.storage.sync.get('__shanbayExtensionSettings', (settings) => {
  if (Object.keys(settings).length) {
    settings.__shanbayExtensionSettings.forEach(item => {
      Object.assign(storage, item)
    })
  } else {
    Object.assign(storage, storageSettingMap)
  }

  // contentMenu
  chrome.contextMenus.removeAll(function () {
    chrome.tabs.query({ active: true })
    .then(tabs => {
      const curUrl = tabs[0].url
      // if (storage.ignoreSites.some(site => curUrl.includes(site))) return
      if (storage.contextLookup) {
        debugLogger('info', 'contextMenu added')
        chrome.contextMenus.create({
          id: Math.random().toString(36),
          title: '在扇贝网中查找 %s',
          contexts: ['selection'],
        })
        chrome.contextMenus.onClicked.addListener((info, tab) => {
          lookUp(info.selectionText).then(res => {
            chrome.tabs.sendMessage(tab.id, {action: 'lookup', data: res})
          })
        })
      }
    })
    .catch()
  })
  getDailyTask()
})
