/* Common */
import Position from './common/position';
import SweetAlert from 'sweetalert2';

/* Core */
import Canvas from './core/canvas';
import Area from './core/area';
import Game from './core/game';
import cellStyles from './core/cell-styles';

class JQueryEvents {
	private readonly area: Area;
	private readonly canvas: Canvas;

	private isMouseDown = false;
	private mouseDownIsActive = false;

	private $canvas = $('#canvas');

	private $buttonTheme = $('.button_theme');

	private $sliderCellSize = $('.input_cell-size');
	private $sliderCellMargin = $('.input_cell-margin');
	private $sliderAppSteps = $('.input_app-steps');

	private $checkboxRule = $('.input_rule');

	constructor(
		private readonly game: Game,
	) {
		this.area = this.game.Area;
		this.canvas = this.area.Canvas;
	}

	private buttonStart = () => {
		const { game } = this;
		const text = $('.button_start').text();

		text === 'start' ? game.Start() : game.Stop();
	};

	private buttonClear = () => {
		this.game.Stop();
		this.area.Clear();
	};

	private buttonSave = () => {
		const config = this.area.GetConfig();

		navigator.clipboard.writeText(config).then(() => {
			SweetAlert.fire({
				title: 'Success.',
				icon: 'success',
				text: 'The configuration is copied to the clipboard',
				color: 'var(--text-color)',
				background: 'var(--settings-color)',
			}).then();
		}, () => {
			SweetAlert.fire({
				title: 'Error.',
				icon: 'error',
				width: 600,
				text: 'Something went wrong',
				color: 'var(--text-color)',
				background: 'var(--settings-color)',
			}).then();
		});
	};

	private buttonLoad = async () => {
		const data = await navigator.clipboard.readText();
		const result = this.area.LoadConfig(data);

		if (result) {
			return;
		}

		SweetAlert.fire({
			title: 'Error!',
			icon: 'error',
			text: 'Can\'t load config!',
			color: 'var(--text-color)',
			background: 'var(--settings-color)',
		}).then();
	};

	private buttonRandomize = () => {
		this.area.RandomizeUnits();
	};

	private buttonFullScreen = () => {
		this.canvas.Resize('full');

		const saveCfg = this.area.GetConfig();

		this.area.Resize();
		this.area.CellStats.ResetAll();
		this.area.LoadConfig(saveCfg);
	};

	private buttonHalfScreen = () => {
		this.canvas.Resize('half');

		const saveCfg = this.area.GetConfig();

		this.area.Resize();
		this.area.CellStats.ResetAll();
		this.area.LoadConfig(saveCfg);
	};

	private sliderAppStepsOnInput = () => {
		const value = parseInt(this.$sliderAppSteps.val() as string);

		$('.value_app-steps').text(value);
		this.game.StepsPerSecond = value;
	};

	private sliderCellSizeOnInput = () => {
		const value = this.$sliderCellSize.val() as string;
		$('.value_cell-size').text(value);
	};

	private sliderCellMarginOnInput = () => {
		const value = this.$sliderCellMargin.val() as string;
		$('.value_cell-margin').text(value);
	};

	private sliderCellSizeOnChange = () => {
		const value = this.$sliderCellSize.val() as string;
		cellStyles.Size = parseInt(value);

		this.canvas.Clear();
		this.canvas.Resize('last');

		const saveCfg = this.area.GetConfig();

		this.area.Resize();
		this.area.CellStats.ResetAll();
		this.area.LoadConfig(saveCfg);
	};

	private sliderCellMarginOnChange = () => {
		const { area } = this;

		const value = this.$sliderCellMargin.val() as string;
		cellStyles.Margin = parseInt(value);

		this.canvas.Clear();
		this.canvas.Resize('last');

		const saveCfg = area.GetConfig();

		area.Resize();
		area.CellStats.ResetAll();
		area.LoadConfig(saveCfg);
	};

	private static getCellPos(cursorX: number, cursorY: number): Position {
		return new Position(
			(cursorX / cellStyles.FullSize) | 0,
			(cursorY / cellStyles.FullSize) | 0,
		);
	}

	private canvasOnMouseDown = (event: JQuery.MouseDownEvent) => {
		this.isMouseDown = true;

		const unitPos = JQueryEvents.getCellPos(event.offsetX, event.offsetY);
		this.mouseDownIsActive = this.area.GetCellStatus(unitPos);
	};

	private canvasOnMouseMove = (event: JQuery.MouseMoveEvent) => {
		if (!this.isMouseDown) {
			return;
		}

		const unitPos = JQueryEvents.getCellPos(event.offsetX, event.offsetY);

		if (this.mouseDownIsActive) {
			this.area.KillCell(unitPos);
		} else {
			this.area.AddCell(unitPos);
		}

		this.area.CellStats.Update();
	};

	private canvasOnMouseUp = (event: JQuery.MouseUpEvent) => {
		if (!this.isMouseDown) {
			return;
		}

		const unitPos = JQueryEvents.getCellPos(event.offsetX, event.offsetY);

		this.isMouseDown = false;

		if (this.mouseDownIsActive) {
			this.area.KillCell(unitPos);
		} else {
			this.area.AddCell(unitPos);
		}
	};

	private checkboxSpace = () => {
		this.area.LoopingSpace = $('.input_space').is(':checked');
	};

	private checkboxRainbowUnits = () => {
		this.canvas.RainbowUnits = $('.input_rainbow-units').is(':checked');
	};

	private initPresets() {
		$('.button_gosper').on('click', () => {
			const config = [
				{ 'X': 31, 'Y': 8 }, { 'X': 29, 'Y': 9 }, { 'X': 31, 'Y': 9 }, { 'X': 19, 'Y': 10 },
				{ 'X': 20, 'Y': 10 }, { 'X': 27, 'Y': 10 }, { 'X': 28, 'Y': 10 }, { 'X': 41, 'Y': 10 },
				{ 'X': 42, 'Y': 10 }, { 'X': 18, 'Y': 11 }, { 'X': 22, 'Y': 11 }, { 'X': 27, 'Y': 11 },
				{ 'X': 28, 'Y': 11 }, { 'X': 41, 'Y': 11 }, { 'X': 42, 'Y': 11 }, { 'X': 7, 'Y': 12 },
				{ 'X': 8, 'Y': 12 }, { 'X': 17, 'Y': 12 }, { 'X': 23, 'Y': 12 }, { 'X': 27, 'Y': 12 },
				{ 'X': 28, 'Y': 12 }, { 'X': 7, 'Y': 13 }, { 'X': 8, 'Y': 13 }, { 'X': 17, 'Y': 13 },
				{ 'X': 21, 'Y': 13 }, { 'X': 23, 'Y': 13 }, { 'X': 24, 'Y': 13 }, { 'X': 29, 'Y': 13 },
				{ 'X': 31, 'Y': 13 }, { 'X': 17, 'Y': 14 }, { 'X': 23, 'Y': 14 }, { 'X': 31, 'Y': 14 },
				{ 'X': 18, 'Y': 15 }, { 'X': 22, 'Y': 15 }, { 'X': 19, 'Y': 16 }, { 'X': 20, 'Y': 16 },
			];
			this.area.LoadConfig(config);
		});

		$('.button_gosper-eater').on('click', () => {
			const config = [
				{ 'X': 67, 'Y': 19 }, { 'X': 65, 'Y': 20 }, { 'X': 67, 'Y': 20 }, { 'X': 55, 'Y': 21 },
				{ 'X': 56, 'Y': 21 }, { 'X': 63, 'Y': 21 }, { 'X': 64, 'Y': 21 }, { 'X': 77, 'Y': 21 },
				{ 'X': 78, 'Y': 21 }, { 'X': 54, 'Y': 22 }, { 'X': 58, 'Y': 22 }, { 'X': 63, 'Y': 22 },
				{ 'X': 64, 'Y': 22 }, { 'X': 77, 'Y': 22 }, { 'X': 78, 'Y': 22 }, { 'X': 43, 'Y': 23 },
				{ 'X': 44, 'Y': 23 }, { 'X': 53, 'Y': 23 }, { 'X': 59, 'Y': 23 }, { 'X': 63, 'Y': 23 },
				{ 'X': 64, 'Y': 23 }, { 'X': 43, 'Y': 24 }, { 'X': 44, 'Y': 24 }, { 'X': 53, 'Y': 24 },
				{ 'X': 57, 'Y': 24 }, { 'X': 59, 'Y': 24 }, { 'X': 60, 'Y': 24 }, { 'X': 65, 'Y': 24 },
				{ 'X': 67, 'Y': 24 }, { 'X': 53, 'Y': 25 }, { 'X': 59, 'Y': 25 }, { 'X': 67, 'Y': 25 },
				{ 'X': 54, 'Y': 26 }, { 'X': 58, 'Y': 26 }, { 'X': 55, 'Y': 27 }, { 'X': 56, 'Y': 27 },
				{ 'X': 68, 'Y': 38 }, { 'X': 69, 'Y': 38 }, { 'X': 68, 'Y': 39 }, { 'X': 69, 'Y': 39 },
				{ 'X': 73, 'Y': 39 }, { 'X': 72, 'Y': 40 }, { 'X': 74, 'Y': 40 }, { 'X': 73, 'Y': 41 },
				{ 'X': 75, 'Y': 41 }, { 'X': 75, 'Y': 42 }, { 'X': 75, 'Y': 43 }, { 'X': 76, 'Y': 43 },
			];
			this.area.LoadConfig(config);
		});

		$('.button_middleweight').on('click', () => {
			const config = [
				{ 'X': 61, 'Y': 19 }, { 'X': 62, 'Y': 19 }, { 'X': 63, 'Y': 19 }, { 'X': 60, 'Y': 20 },
				{ 'X': 61, 'Y': 20 }, { 'X': 62, 'Y': 20 }, { 'X': 63, 'Y': 20 }, { 'X': 64, 'Y': 20 },
				{ 'X': 59, 'Y': 21 }, { 'X': 60, 'Y': 21 }, { 'X': 62, 'Y': 21 }, { 'X': 63, 'Y': 21 },
				{ 'X': 64, 'Y': 21 }, { 'X': 60, 'Y': 22 }, { 'X': 61, 'Y': 22 },
			];
			this.area.LoadConfig(config, 'right');
		});

		$('.button_weekender').on('click', () => {
			const config = [
				{ 'X': 51, 'Y': 16 }, { 'X': 64, 'Y': 16 }, { 'X': 51, 'Y': 17 }, { 'X': 64, 'Y': 17 },
				{ 'X': 50, 'Y': 18 }, { 'X': 52, 'Y': 18 }, { 'X': 63, 'Y': 18 }, { 'X': 65, 'Y': 18 },
				{ 'X': 51, 'Y': 19 }, { 'X': 64, 'Y': 19 }, { 'X': 51, 'Y': 20 }, { 'X': 64, 'Y': 20 },
				{ 'X': 52, 'Y': 21 }, { 'X': 56, 'Y': 21 }, { 'X': 57, 'Y': 21 }, { 'X': 58, 'Y': 21 },
				{ 'X': 59, 'Y': 21 }, { 'X': 63, 'Y': 21 }, { 'X': 56, 'Y': 22 }, { 'X': 57, 'Y': 22 },
				{ 'X': 58, 'Y': 22 }, { 'X': 59, 'Y': 22 }, { 'X': 52, 'Y': 23 }, { 'X': 53, 'Y': 23 },
				{ 'X': 54, 'Y': 23 }, { 'X': 55, 'Y': 23 }, { 'X': 60, 'Y': 23 }, { 'X': 61, 'Y': 23 },
				{ 'X': 62, 'Y': 23 }, { 'X': 63, 'Y': 23 }, { 'X': 54, 'Y': 25 }, { 'X': 61, 'Y': 25 },
				{ 'X': 55, 'Y': 26 }, { 'X': 56, 'Y': 26 }, { 'X': 59, 'Y': 26 }, { 'X': 60, 'Y': 26 },
			];
			this.area.LoadConfig(config, 'bot');
		});

		$('.button_pre-pulsar').on('click', () => {
			const config = [
				{ 'X': 34, 'Y': 1 }, { 'X': 35, 'Y': 1 }, { 'X': 36, 'Y': 1 }, { 'X': 47, 'Y': 1 },
				{ 'X': 48, 'Y': 1 }, { 'X': 49, 'Y': 1 }, { 'X': 73, 'Y': 1 }, { 'X': 74, 'Y': 1 },
				{ 'X': 75, 'Y': 1 }, { 'X': 86, 'Y': 1 }, { 'X': 87, 'Y': 1 }, { 'X': 88, 'Y': 1 },
				{ 'X': 35, 'Y': 2 }, { 'X': 37, 'Y': 2 }, { 'X': 46, 'Y': 2 }, { 'X': 48, 'Y': 2 },
				{ 'X': 74, 'Y': 2 }, { 'X': 76, 'Y': 2 }, { 'X': 85, 'Y': 2 }, { 'X': 87, 'Y': 2 },
				{ 'X': 37, 'Y': 3 }, { 'X': 46, 'Y': 3 }, { 'X': 76, 'Y': 3 }, { 'X': 85, 'Y': 3 },
				{ 'X': 32, 'Y': 4 }, { 'X': 34, 'Y': 4 }, { 'X': 35, 'Y': 4 }, { 'X': 36, 'Y': 4 },
				{ 'X': 37, 'Y': 4 }, { 'X': 38, 'Y': 4 }, { 'X': 45, 'Y': 4 }, { 'X': 46, 'Y': 4 },
				{ 'X': 47, 'Y': 4 }, { 'X': 48, 'Y': 4 }, { 'X': 49, 'Y': 4 }, { 'X': 51, 'Y': 4 },
				{ 'X': 71, 'Y': 4 }, { 'X': 73, 'Y': 4 }, { 'X': 74, 'Y': 4 }, { 'X': 75, 'Y': 4 },
				{ 'X': 76, 'Y': 4 }, { 'X': 77, 'Y': 4 }, { 'X': 84, 'Y': 4 }, { 'X': 85, 'Y': 4 },
				{ 'X': 86, 'Y': 4 }, { 'X': 87, 'Y': 4 }, { 'X': 88, 'Y': 4 }, { 'X': 90, 'Y': 4 },
				{ 'X': 32, 'Y': 5 }, { 'X': 34, 'Y': 5 }, { 'X': 35, 'Y': 5 }, { 'X': 39, 'Y': 5 },
				{ 'X': 40, 'Y': 5 }, { 'X': 43, 'Y': 5 }, { 'X': 44, 'Y': 5 }, { 'X': 48, 'Y': 5 },
				{ 'X': 49, 'Y': 5 }, { 'X': 51, 'Y': 5 }, { 'X': 71, 'Y': 5 }, { 'X': 73, 'Y': 5 },
				{ 'X': 74, 'Y': 5 }, { 'X': 78, 'Y': 5 }, { 'X': 79, 'Y': 5 }, { 'X': 82, 'Y': 5 },
				{ 'X': 83, 'Y': 5 }, { 'X': 87, 'Y': 5 }, { 'X': 88, 'Y': 5 }, { 'X': 90, 'Y': 5 },
				{ 'X': 31, 'Y': 6 }, { 'X': 32, 'Y': 6 }, { 'X': 38, 'Y': 6 }, { 'X': 39, 'Y': 6 },
				{ 'X': 40, 'Y': 6 }, { 'X': 43, 'Y': 6 }, { 'X': 44, 'Y': 6 }, { 'X': 45, 'Y': 6 },
				{ 'X': 51, 'Y': 6 }, { 'X': 52, 'Y': 6 }, { 'X': 70, 'Y': 6 }, { 'X': 71, 'Y': 6 },
				{ 'X': 77, 'Y': 6 }, { 'X': 78, 'Y': 6 }, { 'X': 79, 'Y': 6 }, { 'X': 82, 'Y': 6 },
				{ 'X': 83, 'Y': 6 }, { 'X': 84, 'Y': 6 }, { 'X': 90, 'Y': 6 }, { 'X': 91, 'Y': 6 },
				{ 'X': 36, 'Y': 7 }, { 'X': 37, 'Y': 7 }, { 'X': 39, 'Y': 7 }, { 'X': 40, 'Y': 7 },
				{ 'X': 43, 'Y': 7 }, { 'X': 44, 'Y': 7 }, { 'X': 46, 'Y': 7 }, { 'X': 47, 'Y': 7 },
				{ 'X': 75, 'Y': 7 }, { 'X': 76, 'Y': 7 }, { 'X': 78, 'Y': 7 }, { 'X': 79, 'Y': 7 },
				{ 'X': 82, 'Y': 7 }, { 'X': 83, 'Y': 7 }, { 'X': 85, 'Y': 7 }, { 'X': 86, 'Y': 7 },
				{ 'X': 35, 'Y': 9 }, { 'X': 48, 'Y': 9 }, { 'X': 74, 'Y': 9 }, { 'X': 87, 'Y': 9 },
				{ 'X': 36, 'Y': 10 }, { 'X': 37, 'Y': 10 }, { 'X': 38, 'Y': 10 }, { 'X': 45, 'Y': 10 },
				{ 'X': 46, 'Y': 10 }, { 'X': 47, 'Y': 10 }, { 'X': 75, 'Y': 10 }, { 'X': 76, 'Y': 10 },
				{ 'X': 77, 'Y': 10 }, { 'X': 84, 'Y': 10 }, { 'X': 85, 'Y': 10 }, { 'X': 86, 'Y': 10 },
				{ 'X': 35, 'Y': 11 }, { 'X': 36, 'Y': 11 }, { 'X': 37, 'Y': 11 }, { 'X': 38, 'Y': 11 },
				{ 'X': 45, 'Y': 11 }, { 'X': 46, 'Y': 11 }, { 'X': 47, 'Y': 11 }, { 'X': 48, 'Y': 11 },
				{ 'X': 74, 'Y': 11 }, { 'X': 75, 'Y': 11 }, { 'X': 76, 'Y': 11 }, { 'X': 77, 'Y': 11 },
				{ 'X': 84, 'Y': 11 }, { 'X': 85, 'Y': 11 }, { 'X': 86, 'Y': 11 }, { 'X': 87, 'Y': 11 },
				{ 'X': 34, 'Y': 12 }, { 'X': 35, 'Y': 12 }, { 'X': 48, 'Y': 12 }, { 'X': 49, 'Y': 12 },
				{ 'X': 73, 'Y': 12 }, { 'X': 74, 'Y': 12 }, { 'X': 87, 'Y': 12 }, { 'X': 88, 'Y': 12 },
				{ 'X': 35, 'Y': 13 }, { 'X': 48, 'Y': 13 }, { 'X': 74, 'Y': 13 }, { 'X': 87, 'Y': 13 },
				{ 'X': 33, 'Y': 14 }, { 'X': 34, 'Y': 14 }, { 'X': 35, 'Y': 14 }, { 'X': 48, 'Y': 14 },
				{ 'X': 49, 'Y': 14 }, { 'X': 50, 'Y': 14 }, { 'X': 72, 'Y': 14 }, { 'X': 73, 'Y': 14 },
				{ 'X': 74, 'Y': 14 }, { 'X': 87, 'Y': 14 }, { 'X': 88, 'Y': 14 }, { 'X': 89, 'Y': 14 },
				{ 'X': 33, 'Y': 15 }, { 'X': 50, 'Y': 15 }, { 'X': 72, 'Y': 15 }, { 'X': 89, 'Y': 15 },
				{ 'X': 36, 'Y': 16 }, { 'X': 47, 'Y': 16 }, { 'X': 75, 'Y': 16 }, { 'X': 86, 'Y': 16 },
				{ 'X': 34, 'Y': 17 }, { 'X': 36, 'Y': 17 }, { 'X': 47, 'Y': 17 }, { 'X': 49, 'Y': 17 },
				{ 'X': 73, 'Y': 17 }, { 'X': 75, 'Y': 17 }, { 'X': 86, 'Y': 17 }, { 'X': 88, 'Y': 17 },
				{ 'X': 33, 'Y': 18 }, { 'X': 37, 'Y': 18 }, { 'X': 38, 'Y': 18 }, { 'X': 45, 'Y': 18 },
				{ 'X': 46, 'Y': 18 }, { 'X': 50, 'Y': 18 }, { 'X': 72, 'Y': 18 }, { 'X': 76, 'Y': 18 },
				{ 'X': 77, 'Y': 18 }, { 'X': 84, 'Y': 18 }, { 'X': 85, 'Y': 18 }, { 'X': 89, 'Y': 18 },
				{ 'X': 34, 'Y': 19 }, { 'X': 40, 'Y': 19 }, { 'X': 43, 'Y': 19 }, { 'X': 49, 'Y': 19 },
				{ 'X': 73, 'Y': 19 }, { 'X': 79, 'Y': 19 }, { 'X': 82, 'Y': 19 }, { 'X': 88, 'Y': 19 },
				{ 'X': 40, 'Y': 20 }, { 'X': 43, 'Y': 20 }, { 'X': 79, 'Y': 20 }, { 'X': 82, 'Y': 20 },
				{ 'X': 32, 'Y': 21 }, { 'X': 34, 'Y': 21 }, { 'X': 35, 'Y': 21 }, { 'X': 40, 'Y': 21 },
				{ 'X': 43, 'Y': 21 }, { 'X': 48, 'Y': 21 }, { 'X': 49, 'Y': 21 }, { 'X': 51, 'Y': 21 },
				{ 'X': 71, 'Y': 21 }, { 'X': 73, 'Y': 21 }, { 'X': 74, 'Y': 21 }, { 'X': 79, 'Y': 21 },
				{ 'X': 82, 'Y': 21 }, { 'X': 87, 'Y': 21 }, { 'X': 88, 'Y': 21 }, { 'X': 90, 'Y': 21 },
				{ 'X': 32, 'Y': 22 }, { 'X': 36, 'Y': 22 }, { 'X': 37, 'Y': 22 }, { 'X': 38, 'Y': 22 },
				{ 'X': 40, 'Y': 22 }, { 'X': 43, 'Y': 22 }, { 'X': 45, 'Y': 22 }, { 'X': 46, 'Y': 22 },
				{ 'X': 47, 'Y': 22 }, { 'X': 51, 'Y': 22 }, { 'X': 71, 'Y': 22 }, { 'X': 75, 'Y': 22 },
				{ 'X': 76, 'Y': 22 }, { 'X': 77, 'Y': 22 }, { 'X': 79, 'Y': 22 }, { 'X': 82, 'Y': 22 },
				{ 'X': 84, 'Y': 22 }, { 'X': 85, 'Y': 22 }, { 'X': 86, 'Y': 22 }, { 'X': 90, 'Y': 22 },
				{ 'X': 33, 'Y': 23 }, { 'X': 40, 'Y': 23 }, { 'X': 43, 'Y': 23 }, { 'X': 50, 'Y': 23 },
				{ 'X': 72, 'Y': 23 }, { 'X': 79, 'Y': 23 }, { 'X': 82, 'Y': 23 }, { 'X': 89, 'Y': 23 },
				{ 'X': 32, 'Y': 24 }, { 'X': 35, 'Y': 24 }, { 'X': 36, 'Y': 24 }, { 'X': 40, 'Y': 24 },
				{ 'X': 43, 'Y': 24 }, { 'X': 47, 'Y': 24 }, { 'X': 48, 'Y': 24 }, { 'X': 51, 'Y': 24 },
				{ 'X': 71, 'Y': 24 }, { 'X': 74, 'Y': 24 }, { 'X': 75, 'Y': 24 }, { 'X': 79, 'Y': 24 },
				{ 'X': 82, 'Y': 24 }, { 'X': 86, 'Y': 24 }, { 'X': 87, 'Y': 24 }, { 'X': 90, 'Y': 24 },
				{ 'X': 32, 'Y': 25 }, { 'X': 35, 'Y': 25 }, { 'X': 36, 'Y': 25 }, { 'X': 38, 'Y': 25 },
				{ 'X': 40, 'Y': 25 }, { 'X': 43, 'Y': 25 }, { 'X': 45, 'Y': 25 }, { 'X': 47, 'Y': 25 },
				{ 'X': 48, 'Y': 25 }, { 'X': 51, 'Y': 25 }, { 'X': 71, 'Y': 25 }, { 'X': 74, 'Y': 25 },
				{ 'X': 75, 'Y': 25 }, { 'X': 77, 'Y': 25 }, { 'X': 79, 'Y': 25 }, { 'X': 82, 'Y': 25 },
				{ 'X': 84, 'Y': 25 }, { 'X': 86, 'Y': 25 }, { 'X': 87, 'Y': 25 }, { 'X': 90, 'Y': 25 },
				{ 'X': 36, 'Y': 26 }, { 'X': 39, 'Y': 26 }, { 'X': 44, 'Y': 26 }, { 'X': 47, 'Y': 26 },
				{ 'X': 75, 'Y': 26 }, { 'X': 78, 'Y': 26 }, { 'X': 83, 'Y': 26 }, { 'X': 86, 'Y': 26 },
				{ 'X': 37, 'Y': 27 }, { 'X': 39, 'Y': 27 }, { 'X': 44, 'Y': 27 }, { 'X': 46, 'Y': 27 },
				{ 'X': 76, 'Y': 27 }, { 'X': 78, 'Y': 27 }, { 'X': 83, 'Y': 27 }, { 'X': 85, 'Y': 27 },
				{ 'X': 58, 'Y': 28 }, { 'X': 64, 'Y': 28 }, { 'X': 35, 'Y': 29 }, { 'X': 36, 'Y': 29 },
				{ 'X': 38, 'Y': 29 }, { 'X': 40, 'Y': 29 }, { 'X': 41, 'Y': 29 }, { 'X': 42, 'Y': 29 },
				{ 'X': 43, 'Y': 29 }, { 'X': 45, 'Y': 29 }, { 'X': 47, 'Y': 29 }, { 'X': 48, 'Y': 29 },
				{ 'X': 58, 'Y': 29 }, { 'X': 64, 'Y': 29 }, { 'X': 74, 'Y': 29 }, { 'X': 75, 'Y': 29 },
				{ 'X': 77, 'Y': 29 }, { 'X': 79, 'Y': 29 }, { 'X': 80, 'Y': 29 }, { 'X': 81, 'Y': 29 },
				{ 'X': 82, 'Y': 29 }, { 'X': 84, 'Y': 29 }, { 'X': 86, 'Y': 29 }, { 'X': 87, 'Y': 29 },
				{ 'X': 41, 'Y': 30 }, { 'X': 42, 'Y': 30 }, { 'X': 57, 'Y': 30 }, { 'X': 59, 'Y': 30 },
				{ 'X': 63, 'Y': 30 }, { 'X': 65, 'Y': 30 }, { 'X': 80, 'Y': 30 }, { 'X': 81, 'Y': 30 },
				{ 'X': 33, 'Y': 31 }, { 'X': 35, 'Y': 31 }, { 'X': 36, 'Y': 31 }, { 'X': 47, 'Y': 31 },
				{ 'X': 48, 'Y': 31 }, { 'X': 50, 'Y': 31 }, { 'X': 58, 'Y': 31 }, { 'X': 64, 'Y': 31 },
				{ 'X': 72, 'Y': 31 }, { 'X': 74, 'Y': 31 }, { 'X': 75, 'Y': 31 }, { 'X': 86, 'Y': 31 },
				{ 'X': 87, 'Y': 31 }, { 'X': 89, 'Y': 31 }, { 'X': 31, 'Y': 32 }, { 'X': 32, 'Y': 32 },
				{ 'X': 35, 'Y': 32 }, { 'X': 39, 'Y': 32 }, { 'X': 40, 'Y': 32 }, { 'X': 43, 'Y': 32 },
				{ 'X': 44, 'Y': 32 }, { 'X': 48, 'Y': 32 }, { 'X': 51, 'Y': 32 }, { 'X': 52, 'Y': 32 },
				{ 'X': 58, 'Y': 32 }, { 'X': 64, 'Y': 32 }, { 'X': 70, 'Y': 32 }, { 'X': 71, 'Y': 32 },
				{ 'X': 74, 'Y': 32 }, { 'X': 78, 'Y': 32 }, { 'X': 79, 'Y': 32 }, { 'X': 82, 'Y': 32 },
				{ 'X': 83, 'Y': 32 }, { 'X': 87, 'Y': 32 }, { 'X': 90, 'Y': 32 }, { 'X': 91, 'Y': 32 },
				{ 'X': 32, 'Y': 33 }, { 'X': 33, 'Y': 33 }, { 'X': 35, 'Y': 33 }, { 'X': 48, 'Y': 33 },
				{ 'X': 50, 'Y': 33 }, { 'X': 51, 'Y': 33 }, { 'X': 71, 'Y': 33 }, { 'X': 72, 'Y': 33 },
				{ 'X': 74, 'Y': 33 }, { 'X': 87, 'Y': 33 }, { 'X': 89, 'Y': 33 }, { 'X': 90, 'Y': 33 },
				{ 'X': 34, 'Y': 34 }, { 'X': 35, 'Y': 34 }, { 'X': 37, 'Y': 34 }, { 'X': 46, 'Y': 34 },
				{ 'X': 48, 'Y': 34 }, { 'X': 49, 'Y': 34 }, { 'X': 73, 'Y': 34 }, { 'X': 74, 'Y': 34 },
				{ 'X': 76, 'Y': 34 }, { 'X': 85, 'Y': 34 }, { 'X': 87, 'Y': 34 }, { 'X': 88, 'Y': 34 },
				{ 'X': 35, 'Y': 35 }, { 'X': 38, 'Y': 35 }, { 'X': 45, 'Y': 35 }, { 'X': 48, 'Y': 35 },
				{ 'X': 74, 'Y': 35 }, { 'X': 77, 'Y': 35 }, { 'X': 84, 'Y': 35 }, { 'X': 87, 'Y': 35 },
				{ 'X': 32, 'Y': 36 }, { 'X': 33, 'Y': 36 }, { 'X': 36, 'Y': 36 }, { 'X': 39, 'Y': 36 },
				{ 'X': 44, 'Y': 36 }, { 'X': 47, 'Y': 36 }, { 'X': 50, 'Y': 36 }, { 'X': 51, 'Y': 36 },
				{ 'X': 56, 'Y': 36 }, { 'X': 57, 'Y': 36 }, { 'X': 65, 'Y': 36 }, { 'X': 66, 'Y': 36 },
				{ 'X': 71, 'Y': 36 }, { 'X': 72, 'Y': 36 }, { 'X': 75, 'Y': 36 }, { 'X': 78, 'Y': 36 },
				{ 'X': 83, 'Y': 36 }, { 'X': 86, 'Y': 36 }, { 'X': 89, 'Y': 36 }, { 'X': 90, 'Y': 36 },
				{ 'X': 32, 'Y': 37 }, { 'X': 38, 'Y': 37 }, { 'X': 39, 'Y': 37 }, { 'X': 44, 'Y': 37 },
				{ 'X': 45, 'Y': 37 }, { 'X': 51, 'Y': 37 }, { 'X': 57, 'Y': 37 }, { 'X': 59, 'Y': 37 },
				{ 'X': 63, 'Y': 37 }, { 'X': 65, 'Y': 37 }, { 'X': 71, 'Y': 37 }, { 'X': 77, 'Y': 37 },
				{ 'X': 78, 'Y': 37 }, { 'X': 83, 'Y': 37 }, { 'X': 84, 'Y': 37 }, { 'X': 90, 'Y': 37 },
				{ 'X': 32, 'Y': 38 }, { 'X': 33, 'Y': 38 }, { 'X': 34, 'Y': 38 }, { 'X': 38, 'Y': 38 },
				{ 'X': 45, 'Y': 38 }, { 'X': 49, 'Y': 38 }, { 'X': 50, 'Y': 38 }, { 'X': 51, 'Y': 38 },
				{ 'X': 58, 'Y': 38 }, { 'X': 64, 'Y': 38 }, { 'X': 71, 'Y': 38 }, { 'X': 72, 'Y': 38 },
				{ 'X': 73, 'Y': 38 }, { 'X': 77, 'Y': 38 }, { 'X': 84, 'Y': 38 }, { 'X': 88, 'Y': 38 },
				{ 'X': 89, 'Y': 38 }, { 'X': 90, 'Y': 38 }, { 'X': 34, 'Y': 39 }, { 'X': 35, 'Y': 39 },
				{ 'X': 36, 'Y': 39 }, { 'X': 37, 'Y': 39 }, { 'X': 46, 'Y': 39 }, { 'X': 47, 'Y': 39 },
				{ 'X': 48, 'Y': 39 }, { 'X': 49, 'Y': 39 }, { 'X': 73, 'Y': 39 }, { 'X': 74, 'Y': 39 },
				{ 'X': 75, 'Y': 39 }, { 'X': 76, 'Y': 39 }, { 'X': 85, 'Y': 39 }, { 'X': 86, 'Y': 39 },
				{ 'X': 87, 'Y': 39 }, { 'X': 88, 'Y': 39 }, { 'X': 35, 'Y': 40 }, { 'X': 38, 'Y': 40 },
				{ 'X': 45, 'Y': 40 }, { 'X': 48, 'Y': 40 }, { 'X': 74, 'Y': 40 }, { 'X': 77, 'Y': 40 },
				{ 'X': 84, 'Y': 40 }, { 'X': 87, 'Y': 40 }, { 'X': 35, 'Y': 41 }, { 'X': 48, 'Y': 41 },
				{ 'X': 74, 'Y': 41 }, { 'X': 87, 'Y': 41 }, { 'X': 35, 'Y': 42 }, { 'X': 37, 'Y': 42 },
				{ 'X': 38, 'Y': 42 }, { 'X': 45, 'Y': 42 }, { 'X': 46, 'Y': 42 }, { 'X': 48, 'Y': 42 },
				{ 'X': 74, 'Y': 42 }, { 'X': 76, 'Y': 42 }, { 'X': 77, 'Y': 42 }, { 'X': 84, 'Y': 42 },
				{ 'X': 85, 'Y': 42 }, { 'X': 87, 'Y': 42 }, { 'X': 36, 'Y': 43 }, { 'X': 47, 'Y': 43 },
				{ 'X': 75, 'Y': 43 }, { 'X': 86, 'Y': 43 },
			];
			this.area.LoadConfig(config, 'bot', new Position(0, -2));
		});
	}

	private setTheme = (themeName: string) => {
		document.body.setAttribute('data-theme', themeName);
	};

	private buttonTheme = () => {
		const text = this.$buttonTheme.text();
		const theme = text === 'dark' ? 'light' : 'dark';

		this.setTheme(text);
		this.$buttonTheme.text(theme);
	};

	private initTheme = () => {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.setTheme('dark');
			this.$buttonTheme.text('light');
		} else {
			this.setTheme('light');
			this.$buttonTheme.text('dark');
		}
	};

	private checkboxRule() {
		$('.input_rule').each(
			function () {
				$(this).prop('checked', false);
			},
		);

		$(this).prop('checked', true);
	}

	private checkboxSetRule = () => {
		let rule = 0;

		this.$checkboxRule.each(
			function () {
				if ($(this).is(':checked')) {
					rule = $(this).data('rule');
				}
			},
		);

		this.area.Rule = rule;
	};

	public Bind() {
		$(() => {
			/* Buttons */
			$('.button_start').on('click', this.buttonStart);
			$('.button_clear').on('click', this.buttonClear);
			this.$buttonTheme.on('click', this.buttonTheme);
			$('.button_full-screen').on('click', this.buttonFullScreen);
			$('.button_half-screen').on('click', this.buttonHalfScreen);
			$('.button_config-save').on('click', this.buttonSave);
			$('.button_config-load').on('click', this.buttonLoad);
			$('.button_randomize').on('click', this.buttonRandomize);

			/* Sliders */
			this.$sliderAppSteps.on('input', this.sliderAppStepsOnInput);
			this.$sliderCellSize.on('change', this.sliderCellSizeOnChange);
			this.$sliderCellMargin.on('change', this.sliderCellMarginOnChange);
			this.$sliderCellSize.on('input', this.sliderCellSizeOnInput);
			this.$sliderCellMargin.on('input', this.sliderCellMarginOnInput);

			/* Canvas */
			this.$canvas.on('mousedown', this.canvasOnMouseDown);
			this.$canvas.on('mousemove', this.canvasOnMouseMove);
			this.$canvas.on('mouseup', this.canvasOnMouseUp);

			/* Other */
			this.initTheme();
			this.initPresets();

			/* Checkboxes */
			$('.input_space').on('click', this.checkboxSpace);
			$('.input_rainbow-units').on('click', this.checkboxRainbowUnits);
			this.$checkboxRule.on('click', this.checkboxRule);
			this.$checkboxRule.on('click', this.checkboxSetRule);
		});
	}
}

export default JQueryEvents;