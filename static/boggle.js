class BoggleGame{
    
    constructor(boardId, secs = 60) {
        this.secs = secs; // game length
        this.showTimer();
    
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);
    
        // every 1000 msec, "tick"
        this.timer = setInterval(this.tick.bind(this), 1000);
    
        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    //todo: show word in a list of words
    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word }));
    }

    //todo: show a status message
    showMessage(msg, cls){
        $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`)
    }

    //todo: show score in HTML
    showScore(){
        $(".score", this.board).text(this.score);
    }

    //todo:  handle submission of word: if unique and valid, score & show
    async handleSubmit(evt){
        evt.preventDefault();
        const $word = $(".word", this.board);

        let word = $word.val();
        if (!word) return;

        if (this.words.has(word)){
            this.showMessage(`Already found ${word}`, "err");
            return;
        }

        //todo: Check server for validity:
        const resp = await axios.get("/check-word", { params: {word:word} });
        if (resp.data.result = "not-word"){
            this.showMessage(`${word} is not a valid English word`, "err")
        } else if (resp.data.result = "not-on-board"){
            this.showMessage(`${word} is not a valid word in this board`, "err")
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus();    
    }

    //todo: Update timer in DOM
    showTimer(){
        $(".timer", this.board).text(this.secs);
    }

    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    /* end of game: score and update message. */

    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }

}
