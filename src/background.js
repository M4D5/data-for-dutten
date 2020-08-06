const permissionDesc = {
    active: true,
    currentWindow: true
};

chrome.runtime.onMessage.addListener((message, sender) => {
    const course = message.course;
    const senderTab = sender.tab.id;

    let resp;

    if (course in data) {
        resp = data[course];
    } else {
        resp = undefined;
    }

    chrome.tabs.query(permissionDesc, () => chrome.tabs.sendMessage(senderTab, resp));
});

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({url: chrome.extension.getURL('about.html')}));
