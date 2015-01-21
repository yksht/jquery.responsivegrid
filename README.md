# jquery.responsivegrid
Responsive grid plugin



### Markup:
	<div class="grid">
		<div class="grid-item" data-colspan="2" data-rowspan="2"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="2"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="2"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
		<div class="grid-item" data-colspan="2" data-rowspan="1"></div>
	</div>

### Using without breakpoints:
	<script type="text/javascript">
		$('.grid').responsivegrid({
			'column' : 4,
			'gutter' : '5px',
			'itemHeight' : '80%',
		});
	</script>

### Using with breakpoints:
	<script type="text/javascript">
		$('.grid').responsivegrid({
			'breakpoints': {
				'desktop' : {
					'range' : '*',
					'options' : {
						'column' : 6,
						'gutter' : '20px',
						'itemHeight' : '80%',
					}
				},
				'tablet-landscape' : {
					'range' : '1000-1200',
					'options' : {
						'column' : 4,
						'gutter' : '15px',
						'itemHeight' : '70%',
					}
				},
				'tablet-portrate' : {
					'range' : '767-1000',
					'options' : {
						'column' : 3,
						'gutter' : '10px',
						'itemHeight' : '60%',
					}
				},
				'mobile' : {
					'range' : '-767',
					'options' : {
						'column' : 2,
						'gutter' : '5px',
						'itemHeight' : '50%',
					}
				},
			}
		});
	</script>

### Options:
	'column' : number of blocks per line
	by default: 4
	
	'gutter' : space between blocks. You can use 'px' and '%' (percent from .grid block width)
	By default: 10px
	
	'itemHeight' : item height. You can use 'px' and '%' (percent from .grid-item block width)
	by default: 100%
	
	'itemSelector' : selector for children blocks
	by default: '.grid-item'
