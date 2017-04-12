const __DEV = !!document.querySelector('[mt-variable-value="__DEV"]')

const StelliumIFrameMode = !!document.querySelector('[mt-variable-value="StelliumIFrameMode"]')


const CreditLog = (f, l, e, a, v) => {

    let w = "#fff";

    if ("undefined" !== typeof v && (w = v),
            console.log("%c   ", "font-size:3px;"),
            console.log("%c" + f, "background:" + l + "; color: " + w + "; font-size:14px; padding:5px 10px; font-family:\'Helvetica\';"),
            console.log("%c   ", "font-size:3px;"), null !== e) {
        let g = e.length;
        if (g) for (let h = 0; g > h; h++)
            console.log(e[h].name + " - " + e[h].website)
    }

    if (null !== a) {

        let i = a.length;

        if (i) {
            console.log("%c-", "color:#F06E7B;");
            console.log("%cHand-coded by Fleava, " + " (http://fleava.com)", "color:#F06E7B;");
            for (let j = 0; i > j; j++)
                console.log("%c" + a[j].name + " (" + a[j].website + ")", "color:#F06E7B;")
        }
    }
    console.log("%c-", "color:#F06E7B;")
    console.log(" ")
}

export const writeCredits = () => {

    let creditList = [
        {
            name: "TypeScript",
            website: "https://www.typescriptlang.org"
        },
        {
            name: "Socket.IO",
            website: "http://socket.io"
        },
        {
            name: "Node.js",
            website: "http://nodejs.org"
        },
        {
            name: "Stellium Core",
            website: "http://stellium.io"
        }
    ]

    CreditLog("Stellium", "#F06E7B", null, creditList, "#ffffff")
}


if (!__DEV && !StelliumIFrameMode) writeCredits()