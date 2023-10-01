const stakePill = document.getElementById('stake');
const unstakePill = document.getElementById('unstake');
const stakeBox = document.getElementById('stake-box');
const unstakeBox = document.getElementById('unstake-box');

stakePill.addEventListener('click', () => {
    stakePill.classList.remove('inactive');
    unstakePill.classList.add('inactive');
    
    stakeBox.classList.remove('remove');
    unstakeBox.classList.add('remove');
});

unstakePill.addEventListener('click', () => {
    unstakePill.classList.remove('inactive');
    stakePill.classList.add('inactive');
    
    unstakeBox.classList.remove('remove');
    stakeBox.classList.add('remove');
});







