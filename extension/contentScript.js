//------------------------------------ injecting--------------------------------------

const injectContent = () => {
  const middleToolBar = document.querySelector("div.lefKC + div>div");
  if (!middleToolBar) return false;
  const muteButton = middleToolBar.querySelector(
    'button[aria-label~="microphone" i]'
  );

  if (!muteButton) return false;
};

const getMuteButton = () =>
  document.querySelector(
    'div.Tmb7Fd button[data-is-muted][aria-label*="מיקרופון" i],button[data-is-muted][aria-label*="microphone" i]' //להוסיף לשפות אחרות
  );

//

async function initializePopUp(participantDetails) {}

//------------------------------------muting--------------------------------------

function updateMuteButton(hasPermission) {
  const muteButton = getMuteButton();
  muteButton.disabled = !hasPermission;
  if (
    !convertToBoolean(muteButton.getAttribute("data-is-muted")) &&
    !hasPermission
  ) {
    simulateMute();
  }
}

async function checkParticipant() {
  //This function needs to run on 3 different occations: on loading page, on changing speaking and on changing who has permission
  await chrome.runtime.sendMessage(
    { type: "CHECKPERMISSION", participantDetails: {} },
    (res) => {
      console.log(res);
      updateMuteButton(res.canSpeak);
    }
  );
}

function setupMuteObserver() {
  const config = {
    subtree: true,
    attributeOldValue: true,
    attributeFilter: ["data-is-muted"],
  };

  const observer = new MutationObserver(async (l) => {
    console.log(l);
    await checkParticipant();
  });
  observer.observe(getMuteButton(), config);

  return observer;
}

//-----------------------------------the main function------------------------------------------------------
async function setup() {
  console.log();

  console.log(isParticipantHost());
  let { participantDetails, isHost } = await extractParticipantDetails();

  if (participantDetails) {
    // console.log(await setUpParticipantDetails(participantDetails));
    // await checkParticipant();
    // setupMuteObserver();
    await chrome.runtime.sendMessage(
      { type: "COOKIES-GET", details: {} },
      (res) => {
        participantDetails.UUID = res.UUID;
      }
    );
    console.log(participantDetails);
    await checkParticipant();
    setupMuteObserver();
  } else {
  }
}

(async () => {
  try {
    console.log("b");
    await waitForElementToExist('button[jsname="A5il2e"]');
    console.log("e");
    await setup();
  } catch (err) {
    console.log("failed");
    console.log(err);
  }

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
})();
