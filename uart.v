module uart_rx(input clk,rx,output reg[7:0] data, output reg valid);
parameter clk_bit=234;

reg [10:0] clk_cnt_uart;
reg [2:0] bit_cnt_uart;
reg [7:0] rx_shift = 0;
reg receiving = 0;

always @(posedge clk) begin
	valid<=0;

	if(!receiving) begin
		receiving<=1;
		clk_cnt_uart<=clk_bit/2;
		bit_cnt_uart<=0;
	end
	else begin
		if (clk_cnt_uart==clk_bit-1) begin
            clk_cnt_uart<=0;
            if(bit_cnt_uart<8) begin
            rx_shift[bit_cnt_uart]<=rx;
            bit_cnt_uart<=bit_cnt_uart+1;

            end
            else begin
                data<=rx_shift;
                valid<=1;
                receiving<=0;
            end
			
        end else begin
            clk_cnt_uart<=clk_cnt_uart+1;
	end
	
end
end

endmodule