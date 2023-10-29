const stakePill = document.getElementById('stake');
const unstakePill = document.getElementById('unstake');
const stakeBox = document.getElementById('stake-box');
const unstakeBox = document.getElementById('unstake-box');

stakePill.addEventListener('click', () => {
    stakePill.classList.remove('inactive');
    unstakePill.classList.add('inactive');
    document.querySelector(".details-wrapper").classList.add("remove");
    stakeBox.classList.remove('remove');
    unstakeBox.classList.add('remove');
});

unstakePill.addEventListener('click', () => {
    unstakePill.classList.remove('inactive');
    stakePill.classList.add('inactive');
    document.querySelector(".details-wrapper").classList.remove("remove");
    unstakeBox.classList.remove('remove');
    stakeBox.classList.add('remove');
});
function setMaxValue() {
    var balanceValue = document.getElementById("balance-value").innerText;
    document.getElementById("input-amount").value = balanceValue;
}



async function start(){
    try {
        if (typeof erth_viewing_key === 'undefined') {
            console.log('viewingKey is not defined');
            try {
                erth_viewing_key = await window.keplr.getSecret20ViewingKey(chainId, ERTH_CONTRACT);
                document.querySelector("#balance-value").innerHTML = await try_query_balance(erth_viewing_key, ERTH_CONTRACT, ERTH_HASH);
            } catch {
                document.querySelector("#vk-button-stake").classList.remove("remove");
                document.querySelector("#max-stake").classList.add("remove");
            }
        } else {
            console.log('viewingKey is defined');
        }   
        let querymsg = {
            stake_info: {
              address: secretjs.address
            }
        }
        let tx = await query(querymsg);
        document.querySelector("#loading").classList.add("remove");
        const seconds_in_year =  31536000;
        apy_calc = seconds_in_year * 1000000 / tx.total_staked * 100;
        document.querySelector("#apy-value").innerHTML = floorToDecimals(apy_calc, 2) + "%";
        if (tx.staker_info){
            console.log(tx.staker_info.staked_amount);
            document.querySelector("#staked-balance").innerHTML = Number(tx.staker_info.staked_amount) / 1000000;
            document.querySelector("#staked-amount").innerHTML = Number(tx.staker_info.staked_amount) / 1000000;
            if (tx.staker_info.unstake_requests && tx.staker_info.unstake_requests.length > 0) {
                let total_unstake_amount = 0;
                for (let i = 0; i < tx.staker_info.unstake_requests.length; i++) {
                    total_unstake_amount += Number(tx.staker_info.unstake_requests[i].amount);
                }
                document.querySelector("#unstaking-amount").innerHTML = total_unstake_amount / 1000000;
                let withdraw_date = formatDateFromUTCNanoseconds(tx.staker_info.unstake_requests[0].request_time);
                console.log(withdraw_date);
                document.querySelector("#date-available").innerHTML = withdraw_date;
                

            }
        }
        if (tx.accumulated_reward){
            if (tx.accumulated_reward > 0) {
                document.querySelector("#accumulated-reward").classList.remove("info-value2");
                document.querySelector("#accumulated-reward").classList.add("info-value");
            } else {
                document.querySelector("#accumulated-reward").classList.remove("info-value");
                document.querySelector("#accumulated-reward").classList.add("info-value2");
            }
            document.querySelector("#accumulated-reward").innerHTML = tx.accumulated_reward / 1000000;
        }

        
    } catch (error) {
        console.log(error);
    }
}

function setMaxValue(){
    console.log("test");
    document.querySelector("#input-amount").value = document.querySelector("#balance-value").innerHTML;
}
function setMaxValueStaked(){
    console.log("test");
    document.querySelector("#stake-input").value = document.querySelector("#staked-balance").innerHTML;
}

async function stake() {
    document.querySelector("#loading").classList.remove("remove");
    let compound = await isCompoundEnabled(); 
    amount = Math.floor(document.getElementById("input-amount").value * 1000000);
    let snipmsg = {
        stake: {
            compound: compound,
        },
    }
    await snip(snipmsg, amount);
    document.querySelector("#loading").classList.add("remove");
    location.reload(true);
}

async function unstake_request() {
    amount = Math.floor(document.getElementById("stake-input").value * 1000000);
    let contractmsg = {
        request_unstake: {
            amount: amount.toString(),
        },
    }
    document.querySelector("#loading").classList.remove("remove");
    await contract(contractmsg);
    document.querySelector("#loading").classList.add("remove");
    location.reload(true);
}

async function claim_staking_rewards() {
    document.querySelector("#loading").classList.remove("remove");
    let compound = await isCompoundEnabled(); 
    let contractmsg = {
        claim_staking_rewards: {
            compound : compound,
        },
    }
    try {
        await contract(contractmsg);
        location.reload(true);
    } catch (error) {
        console.log(error);
    }
    document.querySelector("#loading").classList.add("remove");
}

function isCompoundEnabled() {
    const checkbox = document.getElementById('compoundToggle');
    console.log(checkbox.checked);
    return checkbox.checked;
}

async function withdraw_unbondings() {
    let contractmsg = {
        withdraw_unstake: {},
    }
    try {
        await contract(contractmsg);
        location.reload(true);
    } catch (error) {
        console.log(error);
    }
}

async function get_vk() {
    await window.keplr.suggestToken(chainId, ERTH_CONTRACT);
    location.reload(true);
}