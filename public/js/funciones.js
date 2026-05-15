function updateUI() {
	amountText.innerText = `$${currentAmount.toLocaleString()}`;
	periodText.innerText = `${currentPeriod} meses`;
}
// Actualizar el resumen dentro del modal al hacer clic en el botón
$('.btn-solicitar').on('click', function () {
	var monto = $('#amount-value').text();
	var plazo = $('#period-value').text();

	$('#resumenMonto').text(monto);
	$('#resumenPlazo').text(plazo);
});