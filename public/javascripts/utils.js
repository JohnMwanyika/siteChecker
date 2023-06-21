toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
// this function toggles between activating and deactivating a user on flipping the switch
function handleCheckboxChange(siteId,teamId,checkbox) {
    if (!checkbox.checked) {
        axios.post(`/dashboard/monitoring/start`, {
            siteId:siteId,
            teamId:teamId,
            interval:1,
            }, )
            .then((response) => {
                toastr[response.data.status](response.data.data, response.data.status);
                setTimeout(() => {
                    location.reload();
                }, 3000);
                console.log(response);
            })

    } else {
        axios.post(`/dashboard/users/update_status/${userId}`, {
            statusId: 2
            })
            .then((response) => {
                toastr[response.data.status](response.data.data, response.data.status);
                setTimeout(() => {
                    location.reload();
                }, 3000);
                console.log(response);
            })
    }
}


//- toastr[response.data.status](response.data.data, response.data.status)
toastr['success']('Conratulations', 'success')