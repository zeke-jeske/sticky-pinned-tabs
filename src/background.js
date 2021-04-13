let pinnedTabs = []

chrome.runtime.onInstalled.addListener(getPinnedTabs)

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ pinned: true }, (tabs) => {
      if (tabs.length) {
        chrome.tabs.move(tabs.map(({id}) => id), {
          index: 0,
          windowId
        }, () => {
          tabs.forEach(({ id }) => {
            chrome.tabs.update(id, { pinned: true })
          })
        })
      }
    })
  }
})

chrome.windows.onRemoved.addListener((windowId) => {
  chrome.tabs.query(({ pinned: true }), (tabs) => {
    if (!tabs.length) {
      pinnedTabs.forEach((tab) => chrome.tabs.create({
        index: 0,
        pinned: true,
        url: tab.url,
        active: tab.active
      }))
    }
  })
})

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pinned) getPinnedTabs()
})

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (!removeInfo.isWindowClosing) getPinnedTabs()
})

chrome.tabs.onReplaced.addListener(getPinnedTabs)

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ('pinned' in changeInfo) getPinnedTabs()
})

function getPinnedTabs() {
  chrome.tabs.query({ pinned: true }, (tabs) => {
    pinnedTabs = tabs
  })
}
