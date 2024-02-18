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
	constructor( debug=false ){
		this.debug = debug;
		this.factor = {
			min : 0.7,
			max : 1
		};
		this.elements = {
			module_watt : this.$( '#module_watt' ),
			module_count : this.$( '#module_count' ),
			inverter_watt : this.$( '#inverter_watt' ),
			inverter_efficiency : this.$( '#inverter_efficiency' ),
			yearly_usage : this.$( '#yearly_usage' ),
			price_kwh : this.$( '#price_kwh' ),
			acquisition_costs : this.$( '#acquisition_costs' ),
			orientation : this.$( '#orientation' ),
			tilt : this.$( '#tilt' ),
			shading : this.$( '#shading' ),
			lifetime : this.$( '#lifetime' ),
			checklist : this.$( '.bkw-checklist-wrap' )
		};
	}
	$( element ){
		return document.querySelector( element );
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
		this.elements.checklist.addEventListener( 'click', function( event ){
			this.$( '.bkw-checklist' ).classList.toggle( 'hidden' );
		}.bind( this ), false );
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
		const inverter_efficiency = this.parse(this.elements.inverter_efficiency.value);
		const shading_factor = this.parse(this.elements.shading.value);
		const tilt_factor = this.parse(this.elements.tilt.value);
		if( this.debug ) console.log( 'tilt_factor', tilt_factor );
		const peak_watt = ( this.elements.module_watt.value * this.elements.module_count.value );
		if( this.debug ) console.log( 'peak_watt', peak_watt );
		const yearly_costs = ( this.elements.yearly_usage.value * this.parse( this.elements.price_kwh.value ) );
		if( this.debug ) console.log( 'yearly_costs', yearly_costs );
		const generated_electricity = {
			minimum : ( peak_watt * this.factor.min * this.elements.orientation.value * tilt_factor * shading_factor * inverter_efficiency ),
			maximum : ( peak_watt * this.factor.max * this.elements.orientation.value * tilt_factor * shading_factor * inverter_efficiency )
		};
		if( this.debug ) console.log( 'generated_electricity', generated_electricity.minimum, generated_electricity.maximum );
		const generated_return = {
			minimum : ( generated_electricity.minimum * this.parse( this.elements.price_kwh.value ) ),
			maximum : ( generated_electricity.maximum * this.parse( this.elements.price_kwh.value ) )
		};
		if( this.debug ) console.log( 'generated_return', generated_return.minimum, generated_return.maximum );
		const amortization_period = this.round( ( this.parse( this.elements.acquisition_costs.value ) / generated_return.minimum ), 10 );
		if( this.debug ) console.log( 'amortization_period', amortization_period );
		const self_supply = {
			minimum : ( generated_electricity.minimum / this.elements.yearly_usage.value * 100 ),
			maximum : ( generated_electricity.maximum / this.elements.yearly_usage.value * 100 )
		};
		if( this.debug ) console.log( 'self_supply', self_supply.minimum, self_supply.maximum );
		const LCOE = {
			year : this.round( ( this.parse( this.elements.acquisition_costs.value ) / generated_electricity.minimum *10 ), 10 ),
			lifetime : this.round( ( this.parse( this.elements.acquisition_costs.value ) / (generated_electricity.minimum * this.elements.lifetime.value) *10 ), 10 )
		};
		if( this.debug ) console.log( 'LCOE', LCOE.year, LCOE.lifetime );
		this.$( '#bkw-result-system-peak' ).innerHTML = `${this.round( peak_watt, 10 )} Wp`;
		this.$( '#bkw-result-genelec' ).innerHTML = `${this.round( generated_electricity.minimum, 10 )} kWh`;
		this.$( '#bkw-result-savings' ).innerHTML = `${this.round( generated_return.minimum, 1 )} EUR`;
		this.$( '#bkw-result-self-supply' ).innerHTML = `${this.round( self_supply.minimum, 1 )}%`;
		this.$( '#bkw-result-lcoe' ).innerHTML = `${LCOE.year} ct/kWh`;
		this.$( '#bkw-result-armortisation' ).innerHTML = `${amortization_period} Jahre (${this.round(amortization_period*12,1)} Monate)`;
	}
}