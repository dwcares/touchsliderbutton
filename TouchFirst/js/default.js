(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var sliderButton;
    var HEIGHT_THRESHOLD = 70;
    var COMMIT_PADDING = 5;
    var COMMIT_THRESHOLD = HEIGHT_THRESHOLD - COMMIT_PADDING;
    var _commitTimer;

    // Setup the event handlers
    function init() {
        sliderButton = document.querySelector(".sliderButton");

        var roundButton = document.querySelector(".roundButton");
        WinJS.Utilities.addClass(roundButton, "ManipulationElement");
        roundButton.addEventListener("MSPointerDown", downHandler);
        roundButton.addEventListener("MSGestureChange", touchHandler);
        roundButton.addEventListener("MSPointerUp", upHandler);
        roundButton.addEventListener("MSInertiaStart", onInertiaStart);
        roundButton.addEventListener("MSGestureEnd", onGestureEnd, false);
    }

    // What happens when someone puts their finger on the button
    function downHandler(eventObject) {
        try {
            var target = getManipulationElement(eventObject.target);
            target.gestureObject.addPointer(eventObject.pointerId);
            target.gestureObject.pointerType = eventObject.pointerType;
            WinJS.Utilities.addClass(sliderButton, "on");

        } catch (e) {
            debugger;
        }
    }

    // What happens you move your finger on the button
    function touchHandler(eventObject) {
        var target = getManipulationElement(eventObject.target);

        if (Math.abs(target.translationY + eventObject.translationY) < COMMIT_THRESHOLD) {
            WinJS.Utilities.removeClass(target, "commit");
        } else {
            WinJS.Utilities.addClass(target, "commit");
        }

        if (Math.abs(target.translationY + eventObject.translationY) < HEIGHT_THRESHOLD) {
            target.translationY += eventObject.translationY;
            target.style.transform = "translateY(" + target.translationY + "px)";
        }
    }

    // What happens when you lift your finger
    function upHandler(e) {
        var target = getManipulationElement(e.target);
        WinJS.Utilities.removeClass(sliderButton, "on");
    }

    // The inertia after you lift your finger
    function onInertiaStart(e) {
        var target = getManipulationElement(e.target);
        target.gestureObject.stop(e.pointerId);
    };

    // What happens when you finish moving your finger on the button
    function onGestureEnd(e) {
        var target = getManipulationElement(e.target);

        if (target.translationY >= COMMIT_THRESHOLD) {
            makeLowerCase();
        } else if (target.translationY <= 0 - COMMIT_THRESHOLD) {
            makeUpperCase();
        }

        WinJS.Utilities.removeClass(sliderButton, "on");
        WinJS.Utilities.removeClass(target, "commit");

        target.translationY = 0;
        target.gestureObject.pointerType = null;
        target.gestureObject.stop(e.pointerId);
        target.style.transform = "matrix(1, 0, 0, 1, 0, 0)";
    }

    function makeUpperCase() {
        document.querySelector(".loremText").style.textTransform = "uppercase";
    }

    function makeLowerCase() {
        document.querySelector(".loremText").style.textTransform = "lowercase";
    }

    // A helper that goes and gets the right element (if you have nested elements)
    function getManipulationElement(element) {
        var retValue = element;
        while (!WinJS.Utilities.hasClass(retValue, "ManipulationElement")) {
            retValue = retValue.parentNode;
        }

        if (retValue.translationY === null || typeof retValue.translationY === "undefined") {
            retValue.translationY = 0;
        }

        if (retValue.gestureObject === null || typeof retValue.gestureObject === "undefined") {
            retValue.gestureObject = new MSGesture();
            retValue.gestureObject.target = retValue;
        }
        return retValue;
    };


    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            args.setPromise(WinJS.UI.processAll().then(init));
        }
    };

    app.oncheckpoint = function (args) {
    };

    app.start();

})();
