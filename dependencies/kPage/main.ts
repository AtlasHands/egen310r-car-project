import * as $ from "../../dependencies/jquery.js"
class PageManager{
    private pages;
    private currentPageNumber = 0;
    private currentPage:Page;
    private animationSpeed = 200;
    private pageEntryListeners = [[]];
    private pageExitListeners = [[]]
    //When constructing, specify animationSpeed and the pageDiv that holds the pages
    constructor(animationSpeed,pageDiv){
        pageDiv.addClass("pageDiv");
        this.pages = [];
        var currentNumber = 0;
        var pageGroups = pageDiv.find(".pageGroup");
        for(var x=0;x<pageGroups.length;x++){
            var pages = $(pageGroups[x]).find(".page");
            for(var y =0;y<pages.length;y++){
                this.pages.push(new Page(pages[y],currentNumber,$(pages[y]).attr('name')));
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
    public getPages(){
        return this.pages;
    }
    //Returns currentPageNumber
    public getCurrentPageNumber(){
        return this.currentPageNumber;
    }
    public getCurrentPageName(){
        return this.currentPage.getName();
    }
    //Add an additional page to the pages - useful for dynamic loading
    public addPage(DOMpage,number){
        this.pages.push(new Page(DOMpage,number));
    }
    //Remove a page, also useful for dynamic loading
    public removePage(DOMpage){
        for(var x = 0;x<this.pages.length;x++){
            if(DOMpage === this.pages[x]){
                this.pages.splice(x,1);
            }
        }
    }
    public addPageHandler(pageNumber,entryCallback,exitCallback){
        this.pageEntryListeners[pageNumber].push(entryCallback);
        this.pageExitListeners[pageNumber].push(exitCallback);
    }
    //Add handler to execute when the page number is being switched to pageNumber
    public addPageEntryHandler(pageNumber,callback){
        this.pageEntryListeners[pageNumber].push(callback);
    }
    public addPageExitHandler(pageNumber,callback){
        this.pageExitListeners[pageNumber].push(callback);
    }
    //Add handler to range of pages
    public addRangeHandler(startRange,endRange,callbackEntry,callbackExit){
        for(var x = startRange;x<=endRange;x++){
            this.pageEntryListeners[x].push(callbackEntry);
            this.pageExitListeners[x].push(callbackExit);
        }
    }
    public addRangeEntryHandler(startRange,endRange,callback){
        for(var x = startRange;x<=endRange;x++){
            this.pageEntryListeners[x].push(callback);
        }
    }
    public addRangeExitHandler(startRange,endRange,callback){
        for(var x = startRange;x<=endRange;x++){
            this.pageExitListeners[x].push(callback);
        }
    }
    public goToPage(name){
        if(this.currentPage.getName() === name){
            console.warn("Cannot go to the current page on");
        }else{
            var lastPageNumber = this.currentPageNumber;
            var currentPageReference = this.currentPage;
            for(var x = 0;x<this.pages.length;x++){
                if(this.pages[x] !== null && this.pages[x].getName() === name){
                    var requestedPage = this.pages[x];
                    var requested_page_number = requestedPage.getNumber();
                    if(requested_page_number > lastPageNumber){
                        currentPageReference.slidePageLeft(this.animationSpeed);
                        requestedPage.slideInFromRight(this.animationSpeed);
                    }else{
                        currentPageReference.slidePageRight(this.animationSpeed);
                        requestedPage.slideInFromLeft(this.animationSpeed);
                    }
                    this.currentPageNumber = requestedPage.getNumber();
                    this.currentPage = requestedPage;
                    return this.currentPage;
                }
            }
        }
    }
    public goToPageNumber(number){//Navigate to page number
        //If out of range
        var lastPageNumber = this.currentPageNumber;
        var currentPageReference = this.currentPage;
        var requestedPage = this.pages[number];
        if(requestedPage === null){
            console.warn("It looks like you are between page groups");
            return;
        }
        if(requestedPage === undefined){
            console.warn("Page number not defined: " +  number );
            return;
        }
        if(requestedPage.getNumber() == currentPageReference.getNumber()){
            console.warn("Tried to navigate to the same page number you were on");
            return;
        }
        if(!(this.pages.length > number)){
            throw new Error("Page number does not exist!");
        }
        if(this.pageExitListeners[lastPageNumber] !== undefined){//run action listeners associated with page
            for(var x = 0;x<this.pageExitListeners [lastPageNumber].length;x++){
                this.pageExitListeners [lastPageNumber][x].call();
            }
        }
        if(this.pageEntryListeners[number] !== undefined){//run action listeners associated with page
            for(var x = 0;x<this.pageEntryListeners[number].length;x++){
                this.pageEntryListeners[number][x].call();
            }
        }
        if(number > lastPageNumber){
            currentPageReference.slidePageLeft(this.animationSpeed);
            requestedPage.slideInFromRight(this.animationSpeed);
        }else{
            currentPageReference.slidePageRight(this.animationSpeed);
            requestedPage.slideInFromLeft(this.animationSpeed);
        }
        this.currentPageNumber = number;
        this.currentPage = requestedPage;
        return this.currentPage;
    }
    public nextPage(){
        var nextPageNumber = this.currentPageNumber+1;
        if(!(this.pages.length > nextPageNumber)){
            throw new Error("Cannot find next page with number: " + nextPageNumber);
        }else{
            return this.goToPageNumber(nextPageNumber);
        }
    }
    public prevPage(){
        var prevPageNumber = this.currentPageNumber-1;
        if(prevPageNumber < 0){
            throw new Error("Cannot find next page with number: " + prevPageNumber);
        }else{
            return this.goToPageNumber(prevPageNumber);
        }
    }
}
//handles animation of page objects
class Page{
    private pageObject;
    private number;
    private name;
    constructor(domElement,number,name=""){
        this.pageObject = $(domElement);
        this.number = number;
        this.name = name;
    }
    public displayPage(){
        this.pageObject.addClass("displayPage");
    }
    public hidePage(){
        this.pageObject.removeClass("displayPage");
    }
    public slidePageLeft(delay){
        var reference = this.pageObject;
        reference.attr('style','right: 0%');
        reference.animate({
            right: '100%'
        },delay,function(){//remove from display after animation is up
            reference.removeClass("displayPage");
            reference.attr('style');
        });
    }
    public slidePageRight(delay){
        var reference = this.pageObject;
        reference.attr('style',"left: 0%");
        reference.animate({
            left: '100%'
        },delay,function(){//remove from display when animation is up
            reference.removeClass("displayPage");
            reference.attr('style');
        })
    }
    public slideInFromRight(delay){
        var reference = this.pageObject;
        reference.attr('style',"left: 100%");
        reference.addClass("displayPage");
        reference.animate({
            left: "0%"
        },delay);
    }
    public slideInFromLeft(delay){
        var reference = this.pageObject;
        reference.attr('style',"right: 100%");
        reference.addClass("displayPage");
        reference.animate({
            right: "0%"
        },delay);
    }
    public getNumber(){
        return this.number;
    }
    public getName(){
        return this.name;
    }
}
export {PageManager}