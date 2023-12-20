const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/;

function getUrl(url, path) {
  if (path) {
    url = new URL(path, url).toString();
  }

  return url;
}
/* ---------- basic cookie functions -------------------- */
function formatCookieValue(v) {
  return JSON.stringify(v);
}

function readCookieValue(v) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

async function getCookie(name, url, path = null) {
  const domainCookies = await chrome.cookies.getAll({
    name,
    url: getUrl(url, path),
  });
  const savedCookie = domainCookies.find((c) => c.path == path);
  console.log(savedCookie);
  if (savedCookie) {
    savedCookie.value = readCookieValue(savedCookie.value);
  }
  return savedCookie;
}

async function setCookie(newDetails) {
  console.log(newDetails);
  newDetails.value = formatCookieValue(newDetails.value);

  await chrome.cookies.set(newDetails);
}

async function updateCookie(
  newDetails,
  mergeFunc = (old_v, new_v) => ({ ...old_v, ...new_v })
) {
  const currentDetails = await getCookie(
    newDetails.name,
    newDetails.url,
    newDetails.path
  );
  console.log(currentDetails);
  if (currentDetails) {
    newDetails.value = mergeFunc(currentDetails.value, newDetails.value);
    console.log(newDetails);
    await setCookie(newDetails);
  } else {
    await createCookie(
      newDetails.name,
      newDetails.url,
      newDetails.value,
      newDetails.path
    );
  }
}

async function createCookie(name, url, value, path = null) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  await setCookie({
    name,
    url,
    value,
    path,
    httpOnly: true,
    secure: true,
    expirationDate: Math.floor(currentDate.getTime() / 1000),
  });
}

/* ---------- functions for background -------------------- */
const PARTICIPANT_COOKIE_NAME = "Participant";
const COOKIE_URL = "https://meet.google.com";

async function getParticipantCookie(path) {
  if (path[0] != "/") path = "/" + path;
  const currentDetails = await getCookie(
    PARTICIPANT_COOKIE_NAME,
    COOKIE_URL,
    path
  );
  let participantData;
  console.log(currentDetails);
  if (currentDetails) {
    participantData = currentDetails.value;
  } else {
    //a new Participant!
    participantData = { UUID: crypto.randomUUID() };
    await createCookie(
      PARTICIPANT_COOKIE_NAME,
      COOKIE_URL,
      participantData,
      path
    );
  }
  return participantData;
}

const spreakingParticipant = {
  UUID: "b73afd14-c7ec-45bf-833f-5f9de193ec86",
};
const hostParticipant = {
  UUID: "8f288464-21a3-44ea-9192-b897c5264159",
};
function canParticipantSpeak(participantDetails) {
  return (
    participantDetails.UUID == spreakingParticipant.UUID ||
    participantDetails.UUID == hostParticipant.UUID
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const meetingID = sender.url.match(meetURLRegex).groups.id;
    console.log(meetingID);
    const cookieValue = await getParticipantCookie(meetingID);
    console.log(canParticipantSpeak(cookieValue));
    switch (message.type) {
      case "CHECKPERMISSION":
        sendResponse({
          canSpeak: canParticipantSpeak(cookieValue),
        });
        break;
      case "COOKIES-GET":
        sendResponse(cookieValue);
        break;
    }
  })();
  return true; //https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
});

/*createCookie("Participant", "https://meet.google.com", {
  name: "rooss barak",
}).then(() => {
  console.log("made it");
});

getParticipantCookie("kpy-ytir-yej").then((UUID) => {
  console.log(UUID);
  getCookie(PARTICIPANT_COOKIE_NAME, COOKIE_URL, "/kpy-ytir-yej").then((g) => {
    console.log(g);
  });
});*/

/*
 ,
    ,
    path: "/fvb-fntc-hjx",
    value: formatCookieValue({ name: "roy barak", canSpeak: 0 }),
class extensionCookie {
  #cookieDetails;

  
  static createCookie(name, url, value, path = null) {
   
    let newCookie = new extensionCookie(
      name,
      url,
       //The returned domain is not full(missing https in the beginnig)
      //.formatValue(value),
      ,
      path
    );
    newCookie.#cookieDetails.expirationDate = Math.floor(
      currentDate.getTime() / 1000
    );
    newCookie.setCookie();
    return newCookie;
  }

  constructor(name, url, valueFromCookie, path = null ,expirationDate=) {
    this.#cookieDetails = {
      name,
      url,
      valueFromCookie,
    };

    if (path) {
      this.#cookieDetails.path = path;
    }
  }

  static formatValue(v) {
    return JSON.stringify(v);
  }
  static readValue(v){
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  value() {
    return this.constrctor.readValue(this.#cookieDetails.valueFromCookie)
  }

  changeProperties(newProps) {
    this.#cookieDetails = { ...this.#cookieDetails, ...newProps };
  }

  updateValue(newData) {
    let newValue;
    if (typeof this.value == "object") {
      newValue = { ...this.value, ...newData };
    } else {
      newValue = newData;
    }
    this.#cookieDetails.value = newValue;
  }
  async setCookie() {
    //extensionCookie.#formatValue(
  }
}
class secureExtensionCookie extends extensionCookie {
  constructor(name, url, value, path = null) {
    super(name, url, value, path);
    this.changeProperties({ httpOnly: true, secure: true });
  }
}*/
