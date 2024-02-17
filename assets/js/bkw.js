/**
 * Copyright (c) 2024 Dave Beusing <david.beusing@gmail.com>
 *
 * MIT License - https://opensource.org/license/mit/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
export default class BKW {
	/**
	 *
	 */
	constructor(){
		this.debug = true;
		this.factor = {
			min : 0.7,
			max : 1
		};
		this.elements = {
			module_watt : document.getElementById( 'module_watt' ),
			module_count : document.getElementById( 'module_count' ),
			inverter_wp : document.getElementById( 'inverter_wp' ),
			inverter_efficiency : document.getElementById( 'inverter_efficiency' ),
			yearly_usage : document.getElementById( 'yearly_usage' ),
			price_kwh : document.getElementById( 'price_kwh' ),
			acquisition_costs : document.getElementById( 'acquisition_costs' ),
			orientation : document.getElementById( 'orientation' ),
			tilt : document.getElementById( 'tilt' ),
			shading : document.getElementById( 'shading' )
		};
	}
	/**
	 *
	 */
	run(){
		this.calculate();
		for(let [name, element] of Object.entries( this.elements ) ){
			if( this.debug ) console.log( `${name}: ${element}` );
			element.addEventListener( 'change', function( event ){ 
				this.calculate();
			}.bind( this ), false );
		}
	}
	/**
	 * 
	 * @param {*} num 
	 * @returns 
	 */
	round( num, fact ){
		return Math.round( num * fact ) / fact;
	}
	/**
	 * 
	 * @param {*} str 
	 * @returns 
	 */
	parse( str ){
		return parseFloat( str.replace( /,/,'.' ) );
	}
	/**
	 *
	 */
	calculate(){
		let inverter_efficiency = this.parse(this.elements.inverter_efficiency.value);
		let shading_factor = this.parse(this.elements.shading.value);
		let tilt_factor = this.parse(this.elements.tilt.value);
		if( this.debug ) console.log( 'tilt_factor', tilt_factor );
		let peak_watt = ( this.elements.module_watt.value * this.elements.module_count.value );
		if( this.debug ) console.log( 'peak_watt', peak_watt );
		let yearly_costs = ( this.elements.yearly_usage.value * this.parse( this.elements.price_kwh.value ) );
		if( this.debug ) console.log( 'yearly_costs', yearly_costs );
		let generated_electricity = {
			minimum : ( peak_watt * this.factor.min * this.elements.orientation.value * tilt_factor * shading_factor * inverter_efficiency ),
			maximum : ( peak_watt * this.factor.max * this.elements.orientation.value * tilt_factor * shading_factor * inverter_efficiency )
		};
		if( this.debug ) console.log( 'generated_electricity', generated_electricity.minimum, generated_electricity.maximum );
		let generated_return = {
			minimum : ( generated_electricity.minimum * this.parse( this.elements.price_kwh.value ) ),
			maximum : ( generated_electricity.maximum * this.parse( this.elements.price_kwh.value ) )
		};
		if( this.debug ) console.log( 'generated_return', generated_return.minimum, generated_return.maximum );
		let amortization_period = this.round( ( this.parse( this.elements.acquisition_costs.value ) / generated_return.minimum ), 10 );
		if( this.debug ) console.log( 'amortization_period', amortization_period );
		document.getElementById( 'bkw-result-genelec' ).innerHTML = `${this.round( generated_electricity.minimum, 10 )} - ${this.round( generated_electricity.maximum, 10 )} kWh`;
		document.getElementById( 'bkw-result-savings' ).innerHTML = `${this.round( generated_return.minimum, 100 )} - ${this.round( generated_return.maximum, 100 )} EUR`;
		document.getElementById( 'bkw-result-armortisation' ).innerHTML = `${amortization_period} Jahre`;
	}
}