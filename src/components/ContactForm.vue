<template>
    <div>
        <Transition name="submit-message">
            <template v-if="showSubmitMessage">
                <div id="submit-message-container">
                    <div id="submit-message-text-container">
                        <p v-html="submitMessage" id="submit-message-text"></p>
                    </div>
                    <div id="submit-message-button-container" v-show="showSubmitMessage">
                        <button id="close-submit-message" @click=closeSubmitMessage v-show="showSubmitMessage">X</button>
                    </div>
                </div>
            </template>
        </Transition>


        <form id="contact-form" method="post">
            <div class="input-label">
                <label for="name-input">Name<span>{{ nameWarning }}</span></label>
            </div>
            <input 
                required 
                type="text" 
                id="name-input" 
                placeholder="Enter name here…" 
                class="form-control" 
                v-model="name"
            /><br>
            <div class="input-label">
                <label for="email-input">Email<span>{{ emailWarning }}</span></label>
            </div>
            <input 
                required 
                type="email" 
                id="email-input" 
                placeholder="Enter email here…" 
                class="form-control" 
                v-model="email"
            /><br>
            <div class="input-label">
                <label for="message-input">Message<span>{{ messageWarning }}</span></label>
            </div>
            <textarea 
                required 
                id="message-input" 
                rows="3" 
                placeholder="Enter your message…" 
                class="form-control" 
                v-model="message"
            ></textarea><br>
            <!-- <p>{{ name }}, {{ email }}, {{ message }}, {{submitting }}</p> -->
            <!-- <div class="g-recaptcha" data-sitekey="6Lc7cVMUAAAAAM1yxf64wrmO8gvi8A1oQ_ead1ys" class="form-control" style="width:100%;"></div> -->
            <button type="button" id="contact-form-submit" @click=submitForm>Submit</button>
        </form>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                url: 'https://oj6vub3ps7.execute-api.us-east-1.amazonaws.com/prod/contact-us',
                name: '',
                email: '',
                message: '',
                notificationEmail: 'info@backandforthdesigns.com',
                source: 'Back and Forth Designs',
                nameWarning: ' * ',
                emailWarning: ' * ',
                messageWarning: ' * ',
                submitting: false,
                showSubmitMessage: false,
                submitMessage: ''
            };
        },
        methods: {

            resetForm: function() {
                this.name = this.email = this.message = "";
                this.submitting = false;
                this.showSubmitMessage = false;
                this.submitMessage = '';
            },

            submitForm: function(event) {
                event.preventDefault()
                if (this.submitting) {
                    console.log('Form is submitting, Please wait.');
                    return; 
                }
                this.nameWarning = !this.name ? " * This field is required." : " * ";
                this.emailWarning = ((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))) ? " * " : " * Please enter a valid email."
                this.messageWarning = !this.message ? " * This field is required." : " * ";
                if (!this.name || !((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))) || !this.message) return;
                this.submitting = true;
                fetch(
                    this.url, {
                        method: "POST",
                        mode: "cors",
                        credentials: "omit",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        redirect: "follow",
                        body: JSON.stringify({
                            "name": this.name,
                            "email": this.email,
                            "message": this.message,
                            "notificationEmail": this.notificationEmail,
                            "source": this.source
                        })
                    }
                )
                .then((response) => response.json())
                .then((data) => {
                    let responseBody = JSON.parse(data);
                    this.showSubmitMessage = true;
                    if (responseBody.statusCode === 200) {
                        console.log('SUCCESS');
                        this.submitMessage = 'Your message was successfully submitted. Thank you, we will be in touch.'
                        setTimeout(() => { this.resetForm(); }, 5000);
                    } else {
                        console.error(responseBody);
                        this.submitMessage = `There was a problem submitting your message. 
                            Please send us an email at <a href="mailto: info@backandforthdesigns.com" target="_blank">info@backandforthdesigns.com</a>`
                    }
                })
                .catch((error) => {
                    console.error(error);
                    this.showSubmitMessage = true;
                    this.submitMessage = `There was a problem submitting your message. 
                        Please send us an email at <a href="mailto: info@backandforthdesigns.com" target="_blank">info@backandforthdesigns.com</a>`
                });
            },

            closeSubmitMessage: function(event) {
                this.resetForm();
            }
        },
    };
</script>

<style>

#submit-message-container {
    border: 2px solid #AC68A7;
    border-radius: 4px;
    height: auto;
    overflow: hidden;
    display: flex;
    margin-bottom: 1rem;
}

.submit-message-enter-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.submit-message-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.submit-message-enter-from,
.submit-message-leave-to {
  transform: translateX(200px);
  opacity: 0;
}

#submit-message-text-container {
    flex-grow: 8;
    align-self: center;
    padding: 0px 20px;
}

#submit-message-button-container {
    flex-grow: 2;
    align-self: center;
    justify-content: center;
    padding: 0px 20px;
}

#close-submit-message {
    padding: 5px 10px;
}

a {
    color: #75CBD1;
}

label {
    color: #75CBD1;
    margin-bottom: .25rem;
    font-family: "Open Sans";
    font-size: 1rem;
}

label span {
    color: #AC6868;
}

input, label {
    display: block;
}

input, textarea {
    padding: 10px 3px;
    border: 2px solid #AC68A7;
    border-radius: 4px;
    background-color: #D2C8D2;
    font-family: Alegreya;
    font-size: 1rem;
    box-sizing: border-box;
}

input:focus, textarea:focus {
    outline: none;
    border: 3px solid #AC68A7;
    border-radius: 4px;
}

input {
    width: 50%;
}

textarea {
    width: 80%
}

#contact-form-submit {
    margin-top: 1rem;
    padding: 10px 20px;
}

@media (max-width: 600px) {
    input, textarea {
        width: 100%;
    }
    #submit-message-text {
        font-size: .75rem;
    }
}

</style>