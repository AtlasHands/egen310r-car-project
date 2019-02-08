"use strict";
exports.__esModule = true;
var $ = require("../../dependencies/jquery.js");
var PageManager = /** @class */ (function () {
    //When constructing, specify animationSpeed and the pageDiv that holds the pages
    function PageManager(animationSpeed, pageDiv) {
        this.currentPageNumber = 0;
        this.animationSpeed = 200;
        this.pageEntryListeners = [[]];
        this.pageExitListeners = [[]];
        pageDiv.addClass("pageDiv");
        this.pages = [];
        var currentNumber = 0;
        var pageGroups = pageDiv.find(".pageGroup");
        for (var x = 0; x < pageGroups.length; x++) {
            var pages = $(pageGroups[x]).find(".page");
            for (var y = 0; y < pages.length; y++) {
                this.pages.push(new Page(pages[y], currentNumber, $(pages[y]).attr('name')));
                this.pageEntryListeners.push([]);
                this.pageExitListeners.push([]);
                currentNumber++;
            }
            this.pages.push(null);
            this.pageEntryListeners.push([]);
            this.pageExitListeners.push([]);
            currentNumber++;
        }
        this.pages[0].displayPage();
        this.currentPage = this.pages[0];
        this.animationSpeed = animationSpeed;
    }
    PageManager.prototype.getPages = function () {
        return this.pages;
    };
    //Returns currentPageNumber
    PageManager.prototype.getCurrentPageNumber = function () {
        return this.currentPageNumber;
    };
    PageManager.prototype.getCurrentPageName = function () {
        return this.currentPage.getName();
    };
    //Add an additional page to the pages - useful for dynamic loading
    PageManager.prototype.addPage = function (DOMpage, number) {
        this.pages.push(new Page(DOMpage, number));
    };
    //Remove a page, also useful for dynamic loading
    PageManager.prototype.removePage = function (DOMpage) {
        for (var x = 0; x < this.pages.length; x++) {
            if (DOMpage === this.pages[x]) {
                this.pages.splice(x, 1);
            }
        }
    };
    PageManager.prototype.addPageHandler = function (pageNumber, entryCallback, exitCallback) {
        this.pageEntryListeners[pageNumber].push(entryCallback);
        this.pageExitListeners[pageNumber].push(exitCallback);
    };
    //Add handler to execute when the page number is being switched to pageNumber
    PageManager.prototype.addPageEntryHandler = function (pageNumber, callback) {
        this.pageEntryListeners[pageNumber].push(callback);
    };
    PageManager.prototype.addPageExitHandler = function (pageNumber, callback) {
        this.pageExitListeners[pageNumber].push(callback);
    };
    //Add handler to range of pages
    PageManager.prototype.addRangeHandler = function (startRange, endRange, callbackEntry, callbackExit) {
        for (var x = startRange; x <= endRange; x++) {
            this.pageEntryListeners[x].push(callbackEntry);
            this.pageExitListeners[x].push(callbackExit);
        }
    };
    PageManager.prototype.addRangeEntryHandler = function (startRange, endRange, callback) {
        for (var x = startRange; x <= endRange; x++) {
            this.pageEntryListeners[x].push(callback);
        }
    };
    PageManager.prototype.addRangeExitHandler = function (startRange, endRange, callback) {
        for (var x = startRange; x <= endRange; x++) {
            this.pageExitListeners[x].push(callback);
        }
    };
    PageManager.prototype.goToPage = function (name) {
        if (this.currentPage.getName() === name) {
            console.warn("Cannot go to the current page on");
        }
        else {
            var lastPageNumber = this.currentPageNumber;
            var currentPageReference = this.currentPage;
            for (var x = 0; x < this.pages.length; x++) {
                if (this.pages[x] !== null && this.pages[x].getName() === name) {
                    var requestedPage = this.pages[x];
                    var requested_page_number = requestedPage.getNumber();
                    if (requested_page_number > lastPageNumber) {
                        currentPageReference.slidePageLeft(this.animationSpeed);
                        requestedPage.slideInFromRight(this.animationSpeed);
                    }
                    else {
                        currentPageReference.slidePageRight(this.animationSpeed);
                        requestedPage.slideInFromLeft(this.animationSpeed);
                    }
                    this.currentPageNumber = requestedPage.getNumber();
                    this.currentPage = requestedPage;
                    return this.currentPage;
                }
            }
        }
    };
    PageManager.prototype.goToPageNumber = function (number) {
        //If out of range
        var lastPageNumber = this.currentPageNumber;
        var currentPageReference = this.currentPage;
        var requestedPage = this.pages[number];
        if (requestedPage === null) {
            console.warn("It looks like you are between page groups");
            return;
        }
        if (requestedPage === undefined) {
            console.warn("Page number not defined: " + number);
            return;
        }
        if (requestedPage.getNumber() == currentPageReference.getNumber()) {
            console.warn("Tried to navigate to the same page number you were on");
            return;
        }
        if (!(this.pages.length > number)) {
            throw new Error("Page number does not exist!");
        }
        if (this.pageExitListeners[lastPageNumber] !== undefined) { //run action listeners associated with page
            for (var x = 0; x < this.pageExitListeners[lastPageNumber].length; x++) {
                this.pageExitListeners[lastPageNumber][x].call();
            }
        }
        if (this.pageEntryListeners[number] !== undefined) { //run action listeners associated with page
            for (var x = 0; x < this.pageEntryListeners[number].length; x++) {
                this.pageEntryListeners[number][x].call();
            }
        }
        if (number > lastPageNumber) {
            currentPageReference.slidePageLeft(this.animationSpeed);
            requestedPage.slideInFromRight(this.animationSpeed);
        }
        else {
            currentPageReference.slidePageRight(this.animationSpeed);
            requestedPage.slideInFromLeft(this.animationSpeed);
        }
        this.currentPageNumber = number;
        this.currentPage = requestedPage;
        return this.currentPage;
    };
    PageManager.prototype.nextPage = function () {
        var nextPageNumber = this.currentPageNumber + 1;
        if (!(this.pages.length > nextPageNumber)) {
            throw new Error("Cannot find next page with number: " + nextPageNumber);
        }
        else {
            return this.goToPageNumber(nextPageNumber);
        }
    };
    PageManager.prototype.prevPage = function () {
        var prevPageNumber = this.currentPageNumber - 1;
        if (prevPageNumber < 0) {
            throw new Error("Cannot find next page with number: " + prevPageNumber);
        }
        else {
            return this.goToPageNumber(prevPageNumber);
        }
    };
    return PageManager;
}());
exports.PageManager = PageManager;
//handles animation of page objects
var Page = /** @class */ (function () {
    function Page(domElement, number, name) {
        if (name === void 0) { name = ""; }
        this.pageObject = $(domElement);
        this.number = number;
        this.name = name;
    }
    Page.prototype.displayPage = function () {
        this.pageObject.addClass("displayPage");
    };
    Page.prototype.hidePage = function () {
        this.pageObject.removeClass("displayPage");
    };
    Page.prototype.slidePageLeft = function (delay) {
        var reference = this.pageObject;
        reference.attr('style', 'right: 0%');
        reference.animate({
            right: '100%'
        }, delay, function () {
            reference.removeClass("displayPage");
            reference.attr('style');
        });
    };
    Page.prototype.slidePageRight = function (delay) {
        var reference = this.pageObject;
        reference.attr('style', "left: 0%");
        reference.animate({
            left: '100%'
        }, delay, function () {
            reference.removeClass("displayPage");
            reference.attr('style');
        });
    };
    Page.prototype.slideInFromRight = function (delay) {
        var reference = this.pageObject;
        reference.attr('style', "left: 100%");
        reference.addClass("displayPage");
        reference.animate({
            left: "0%"
        }, delay);
    };
    Page.prototype.slideInFromLeft = function (delay) {
        var reference = this.pageObject;
        reference.attr('style', "right: 100%");
        reference.addClass("displayPage");
        reference.animate({
            right: "0%"
        }, delay);
    };
    Page.prototype.getNumber = function () {
        return this.number;
    };
    Page.prototype.getName = function () {
        return this.name;
    };
    return Page;
}());
