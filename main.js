define(function (require, exports, module) {
	"use strict";


	var CommandManager = brackets.getModule("command/CommandManager"),
		Menus          = brackets.getModule("command/Menus");


	// Function to run when the menu item is clicked
	function handleInit() {
		
	}


	// First, register a command - a UI-less object associating an id to a handler
	var MY_COMMAND_ID = "brackets.php_corrections";   // package-style naming to avoid collisions
	CommandManager.register("PHP corrections", MY_COMMAND_ID, handleInit);

	// Then create a menu item bound to the command
	// The label of the menu item is the name we gave the command (see above)
	var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
	menu.addMenuItem(MY_COMMAND_ID);

	// We could also add a key binding at the same time:
	//menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-W");
	// (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)



	/*
    var AppInit = brackets.getModule("utils/AppInit"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        KeyEvent = brackets.getModule("utils/KeyEvent");



    var keyEventHandler = function ($event, editor, event) {
    if ((event.type === "keydown") && (event.keyCode === KeyEvent.DOM_VK_TAB)) {
        console.log("Tab pressed!");
    }

      AppInit.appReady(function () {
        var currentEditor = EditorManager.getCurrentFullEditor();
        $(currentEditor).on('keyEvent', keyEventHandler);
    });
    */




	var DocumentManager = brackets.getModule("document/DocumentManager");
	var EditorManager = brackets.getModule("editor/EditorManager");
	var KeyEvent = brackets.getModule("utils/KeyEvent");

	var FileUtils = brackets.getModule("file/FileUtils");
	var AppInit = brackets.getModule("utils/AppInit");


	AppInit.appReady(function () {

		console.log('APP READ _:::');
		$(EditorManager).on("activeEditorChange", function () {




			var currentDoc = DocumentManager.getCurrentDocument();

			var EditorManager = brackets.getModule("editor/EditorManager");
			var currentEditor = EditorManager.getCurrentFullEditor();



			currentEditor.on('keyup',function(brackets_event,editor,event){

				var current_char = event.keyCode;

				console.log('current_char: '+current_char);

				var line_number = currentEditor.getCursorPos().line;				

				var char_number = currentEditor.getCursorPos().ch;					
				var line = currentEditor.document.getLine(line_number);										
				var line_length = line.length									
				var line_trimmed = line.trim();					
				if(event.keyCode) console.log('keycode__: '+event.keyCode);
				if ((event.type === "keyup") && (event.keyCode === 190)) { 	// ">"					
					console.log('LINE UP: '+line);		
					if(line.charAt(char_number-2)=='?'){
						console.log('BINGO UP');
						if(line.length>=char_number && line.charAt(char_number)=='"'){
							console.log('BINGO UP 2');
							currentEditor.setCursorPos({line:line_number,ch:char_number+1});
							console.log('BINGO UP 3');
							return false;
						}
					}
				}

				// nbsp



				if(line_trimmed.indexOf('&n')!=-1 && line_trimmed.indexOf('&nb')==-1){						
					console.log('nnnnnbbbb');
					var replaced_ = line.replace('&nb','&nbsp;');
					replaced_ = replaced_.replace('&n','&nbsp;');
					replaced_+=' ';
					console.log('REPLACED: '+ replaced_);
					editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:99999});							 						
					return false;
				}


				if(line.indexOf('click()', line.length - 'click()'.length) !== -1){
					var replaced_ = "click(function(){";
					var offset_left = line.substr(0,line.indexOf(line.trimLeft()));
					console.log("OFFS:_"+offset_left+"_")
					replaced_+= "\n"+offset_left+"	";
					replaced_+= "\n"+offset_left+"});";
					editor.document.replaceRange(replaced_,{line:line_number,ch:line.indexOf('click')},{line:line_number,ch:line.length});
					currentEditor.setCursorPos({line:line_number+1,ch:99999}); //last char?
				}



			})



			currentEditor.on('keydown',function (brackets_event,editor,event) {	 //it was keydown before	.Aslo down		


				var current_char = event.keyCode;
				if(event.keyCode) console.log('keycode: '+event.keyCode);				



				var line_number = currentEditor.getCursorPos().line;					
				var line = currentEditor.document.getLine(line_number);					
				var line_length = line.length
				var line_trimmed = line.trim();					
				// monitor clear
				console.log('LINE TRIMMED IS: '+line_trimmed);
				if(line_trimmed=='clear' ){		
					var offset_left = line.substr(0,line.indexOf('clear'));				
					var replaced_ = offset_left+'<div style="clear:both"> </div>';
					editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});							 						
				}




				// cuando sse aprieta enter
				if ((event.type === "keydown") && (event.keyCode === 13)) { 
					// enter;


					var char_number = currentEditor.getCursorPos().ch;					


					var line_trimmed_right = line.trimRight();
					var line_trimmed_left = line.trimLeft();
					var offset_left = line.substr(0,line.indexOf(line_trimmed_left));

					var stop_applying = false;

					var file_path = currentEditor.document.file.fullPath;
					var extension = FileUtils.getFileExtension(file_path)

					var php = false;
					var js = false;
					var html = false;


					if(extension=='js'){
						js= true; // for sure is js
					}else if(extension=='php'){
						//php = true;				
					}else if(extension=='html' || extension=='htm' || extension =='tpl'){
						//html = true; // we might be inside javascript	
					}else if(extension=='css'){
						console.log('css');
						return; // por ahora
					}else{
						//lets not apply
						console.log('no idea');
						return;
					}




					// if we are in the beggining of a comments
					// Also are we on js /  php or any other?
					if(line_trimmed_left.substr(0,2)=='//' || line_trimmed_left.substr(0,2)=='/*'){
						console.log('return bc comment');
						return;
					}

					var check_for_comments = true;
					var check_for_js_block = true;
					var check_for_php_block = true;
					for(i=line_number;i>=0;i--){
						var l = currentEditor.document.getLine(i);					

						if(l.indexOf('*/')!=-1) check_for_comments = false;
						if(check_for_comments && l.trimLeft().substr(0,2)=='/*'){													
							// we are in a comment
							console.log('rETURN bc we are in a comment');
							return;
						}

						if(!js && l.indexOf('</script>')!=-1) check_for_js_block = false;
						if(!js && check_for_js_block && l.indexOf('<script')!=-1){
							js =  true;
							break;
						}


						if(!php && l.indexOf('?>')!=-1) check_for_php_block = false;
						if(!php && check_for_php_block && l.indexOf('<?')!=-1){
							php = true;
							break;
						}						
					}
					if(!php && !js) html = true;


					//html block -> no rules
					if(html){
						console.log('RETURN bc html');
						return;
					}





					console.log('LINE IS: '+line);

					//// REGLA PRINT, PRINTR PRINT_R
					var prefix = line.trimLeft().toLowerCase();				
					prefix = prefix.substr(0,prefix.indexOf(" "));
					var first_word = prefix;

					var words = line.trimRight().split(" ");

					var last_char = line_trimmed_right.charAt(line_trimmed_right.length-1);
					var last_word = "";
					if(words.length>0){
						last_word = words[words.length-1];	
					} 
					else{ 
						last_word = words[0];
					}

					console.log('LW: '+last_word+' length words'+words.length);

					if(!stop_applying && (prefix=="print_r" || prefix=="printr" || prefix =="print")){

						var total = line.length;						
						var offset_left = line.substr(0,line.indexOf('p'));
						var inside = line.replace('print_r','').replace('printr','').replace("print",'');;						
						inside = inside.trimLeft()
						if(inside.charAt(0)!='$'){
							inside = '$'+inside.trimLeft();
						}
						var replaced_ = offset_left+'print_r('+inside.trimRight()+');'
						//replaced_ = replaced_+');';
						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:total});
						stop_applying = true;
					}


					// regla echo
					if(!stop_applying && first_word=='echo' && line.indexOf('echo $')==-1 && line.indexOf("echo '")==-1 && last_char!=';'){

						//Es literal o variable???
						if(line.replace('echo ','').split(" ").length>1){
							//literal: hay más de 1palabra;
							var replaced_ = line.replace('echo ',"echo '")+"'";
						}else{
							var replaced_ = line.replace('echo ','echo $');
						}

						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:total});

						//recalcular
						line = currentEditor.document.getLine(line_number);					
						line_length = line.length;
						line_trimmed = line.trim();
						line_trimmed_right = line.trimRight();
						line_trimmed_left = line.trimLeft();

					}



					// mysql_fetch_array to mysql_fetch_assoc
					if(!stop_applying && line.indexOf('mysql_fetch_array')!=-1 ){						
						var replaced_ = line.replace('mysql_fetch_array','mysql_fetch_assoc');
						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});							 						
					}


					//Regles return true/false
					if(!stop_applying && line_trimmed.length>0 && (last_word.trim() =='false' || last_word.trim()=='false;') ){
						offset_left = line.substr(0,line.indexOf('false'));
						if(offset_left.toLowerCase().indexOf("return") == -1 && line_trimmed.indexOf("=") == -1){ // does not contain return and = 
							var replaced_ = offset_left+'return false;';						
							editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});
							stop_applying = true;
						}
					}

					if(!stop_applying && line_trimmed.length>0 && (last_word.trim()=='true' || last_word.trim()=='true;') ){
						offset_left = line.substr(0,line.indexOf('true'));
						if(offset_left.toLowerCase().indexOf("return") == -1 && line_trimmed.indexOf("=") == -1){ // does not contain return and = 
							var replaced_ = offset_left+'return true;'
							editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});
							stop_applying = true;
						}
					}



					//// REGLA IF no parentesis;
					var prefix = line.trimLeft().toLowerCase();				
					prefix = prefix.substr(0,prefix.indexOf(" "));
					if(!stop_applying && first_word=="if"){
						var replaced_ = offset_left+first_word+'('+line.trimLeft().replace('if ','')+')'+'{';
						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});
						stop_applying = true;
					};



					//REGLA log
					if(!stop_applying && js && first_word=='log' ){						
						var replaced_ = line.replace('log ','console.log(')+');';
						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});							 						
						stop_applying = true;
					}


					// are we in a sql, then partition all

					if(!stop_applying && (line.indexOf('_query')!=-1 || line.indexOf('->query')!=-1) ){
						console.log('we are on a aquery and pressed enter');
						// are we in the middle of string?	
						var inside_literal = false;
						for(var i=char_number; i>=0;i--){
							var char = line.charAt(i);
							if(char=='"' && inside_literal==false){
								inside_literal = true;
								console.log('inside literal');								
							}else if(char=='"' && inside_literal==true){
								inside_literal = false; //outside
							}
						}
						if(inside_literal){
							console.log('inside literal'	);
							console.log(line);

							//var replaced_ = line.replace(',','\n');
							var replaced_ = line.replace(/,/g, ',\n');

							console.log(replaced_)
							editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});							 			
						}

					}


					/// REGLA forgot punto y coma
					if(!stop_applying && line_trimmed_right.length>0 &&
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!='{' &&
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!='}' && 
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!='(' &&
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!='>' && 
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!=',' && 
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!=';' && 
					   line_trimmed_right.charAt(line_trimmed_right.length-1)!='/'){
						var replaced_ = line_trimmed_right+';'
						editor.document.replaceRange(replaced_,{line:line_number,ch:0},{line:line_number,ch:line_length});
						stop_applying = true;
					}


					window.my_plugin = this;

				}


			});

			/**DEBUG**/ 

			window.editor_ = currentEditor;

			/**DEBUG**/ 



		})


	});













});