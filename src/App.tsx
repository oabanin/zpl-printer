import React, {FormEvent} from 'react';

let device: any;
let label: any;


async function printZPL() {
    if (device) {
        const textarea = document.getElementById('zpldata') as HTMLTextAreaElement;
        const encoder = new TextEncoder();
        const text = textarea && textarea.value;
        const data = encoder.encode(text);
        try {
            label.innerText = 'Printing...';
            const res = await device.transferOut(1, data);  //2 - samsung, 1 - zpl
            label.innerText = 'Check the printer!';
            console.log(res);
        } catch (e) {
            alert('Device disconnected!')
        }
    } else {
        alert('No device!');
    }
}

async function printPDF() {
    if (device) {


        const target = document.getElementById('myfile') as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (!file) return;
        const fr = new FileReader();
        fr.onload = async (e) => {
            if(fr.result){
                const uint8View = new Uint8Array(fr.result as ArrayBufferLike);
                const res = await device.transferOut(2, uint8View);  //2 - samsung, 1 - zpl
                console.log(res);
                //console.log(uint8View);
            }

        }
        fr.readAsArrayBuffer(file);

        // try {
        //     label.innerText = 'Printing...';
        //     label.innerText = 'Check the printer!';
        //     console.log(res);
        // } catch (e) {
        //     alert('Device disconnected!')
        // }
    } else {
        alert('No device!');
    }
}

function showConnectButton() {
    const btn = document.querySelector('.connectbtn') as HTMLButtonElement;
    btn.addEventListener('click', connectPrinter, false);
}

function hideConnectButton() {
    const btn = document.querySelector('.connectbtn') as HTMLButtonElement;
    btn && btn.parentElement?.removeChild(btn);
}

async function connectPrinter() {
    // Check if we have devices available
    let devices = await navigator.usb.getDevices();
    device = devices[0];
    label = document.getElementById('label');
    if (devices.length === 0) {
        try {
            // Get permission from the user to use their printer
            await navigator.usb.requestDevice({filters: []});
            //device = await navigator.usb.requestDevice({ filters: []});
            //      device = await navigator.usb.requestDevice({ filters: [{ vendorId: VENDOR_ID }]});
        } catch (e) {
            label.innerText = 'Please give permission to get the USB printer...';
            console.warn(e);
        }
    }
    if (device) {
        console.log(device);
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);
        const printer = document.getElementById('printer') as HTMLElement;
        printer.innerText = `Printer: ${device.productName}`;
        hideConnectButton();
    } else {
        console.log("No devices...");
    }
}


const upload = async (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = function(e) {
        if(fr.result){
            const uint8View = new Uint8Array(fr.result as ArrayBufferLike);
            //console.log(uint8View);
        }

    }
    fr.readAsArrayBuffer(file);


};

function App() {
    return (
        <div>
            <header>
                <h1>ZPL over USB via WebUSB API Demo</h1>
            </header>
            <button onClick={() => {
                connectPrinter()
            }} className="connectbtn">Connect printer
            </button>
            <p id="printer"></p>
            <textarea id="zpldata" placeholder="Paste ZPL"></textarea>
            <p id="label"></p>
            <button onClick={() => {
                printZPL()
            }} >Print ZPL
            </button>



            <input onChange={upload} type="file" id="myfile" name="myfile"/>
            <button onClick={() => {
                printPDF()
            }} >Print PDF
            </button>
        </div>
    );
}

export default App;
